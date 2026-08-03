import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_HOURS = 1;
const RESEND_COOLDOWN_MINUTES = 2;

/**
 * POST /api/auth/signup
 * Creates a new unverified user and generates an email verification token.
 */
export async function signup(req, res) {
  const { name, email, password } = req.body;

  // ── Validate required fields ───────────────────────────────────────────────
  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'name, email, and password are required.',
    });
  }

  // ── Password strength enforcement ─────────────────────────────────────────
  const passwordErrors = [];
  if (password.length < 8) passwordErrors.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) passwordErrors.push('at least one uppercase letter');
  if (!/[0-9]/.test(password)) passwordErrors.push('at least one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    passwordErrors.push('at least one special character (!@#$%^&* etc.)');
  }

  if (passwordErrors.length > 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Password must contain: ${passwordErrors.join(', ')}.`,
    });
  }

  try {
    // ── Check for duplicate email ──────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists.',
      });
    }

    // ── Hash password ──────────────────────────────────────────────────────
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // ── Create user ────────────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        is_verified: false,
        role: 'user',
      },
    });

    // ── Generate verification token ────────────────────────────────────────
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(
      Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    await prisma.emailToken.create({
      data: {
        user_id: user.id,
        token,
        type: 'verify',
        expires_at,
      },
    });

    // ── Send verification email ────────────────────────────────────────────
    try {
      await sendVerificationEmail(user.email, user.name, token);
    } catch (emailErr) {
      console.error(
        '[signup] Verification email failed to send:',
        emailErr.message
      );
    }

    // ── Return success ─────────────────────────────────────────────────────
    return res.status(201).json({
      message:
        'Account created. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('[signup] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

/**
 * POST /api/auth/verify-email or GET /api/auth/verify-email?token=...
 * Validates verification token, activates user, and removes token.
 */
export async function verifyEmail(req, res) {
  const token = req.body?.token || req.query?.token;

  if (!token) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Verification token is required.',
    });
  }

  try {
    // ── Find matching token ────────────────────────────────────────────────
    const record = await prisma.emailToken.findFirst({
      where: {
        token,
        type: 'verify',
      },
      include: {
        user: true,
      },
    });

    if (!record) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid or expired verification token.',
      });
    }

    // ── Check token expiration ─────────────────────────────────────────────
    if (new Date() > new Date(record.expires_at)) {
      // Clean up expired token
      await prisma.emailToken.delete({ where: { id: record.id } });
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Verification token has expired. Please request a new one.',
      });
    }

    // ── Mark user verified & remove token in transaction ───────────────────
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.user_id },
        data: { is_verified: true },
      }),
      prisma.emailToken.delete({
        where: { id: record.id },
      }),
    ]);

    return res.status(200).json({
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (err) {
    console.error('[verifyEmail] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

/**
 * POST /api/auth/login
 * Authenticates user credentials, blocks unverified users, and returns a signed JWT.
 */
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email and password are required.',
    });
  }

  try {
    // ── Find user by email ──────────────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // ── Check password ──────────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // ── Check verification status ───────────────────────────────────────────
    if (!user.is_verified) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Please verify your email address before logging in.',
      });
    }

    // ── Issue JWT ───────────────────────────────────────────────────────────
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me_in_prod';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const tokenPayload = {
      jti: crypto.randomUUID(),   // unique token ID for blocklist-based revocation
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, secret, { expiresIn });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[login] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

/**
 * POST /api/auth/resend-verification
 * Resends a verification email to an unverified user with rate limiting.
 */
export async function resendVerification(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email address is required.',
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User account with this email was not found.',
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'This account email is already verified.',
      });
    }

    // ── Rate limiting check (cooldown) ─────────────────────────────────────
    const cooldownCutoff = new Date(
      Date.now() - RESEND_COOLDOWN_MINUTES * 60 * 1000
    );
    const recentToken = await prisma.emailToken.findFirst({
      where: {
        user_id: user.id,
        type: 'verify',
        created_at: {
          gte: cooldownCutoff,
        },
      },
    });

    if (recentToken) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Please wait ${RESEND_COOLDOWN_MINUTES} minutes before requesting another verification email.`,
      });
    }

    // ── Clear old verify tokens for this user ─────────────────────────────
    await prisma.emailToken.deleteMany({
      where: {
        user_id: user.id,
        type: 'verify',
      },
    });

    // ── Create new token ───────────────────────────────────────────────────
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(
      Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    await prisma.emailToken.create({
      data: {
        user_id: user.id,
        token,
        type: 'verify',
        expires_at,
      },
    });

    // ── Send verification email ────────────────────────────────────────────
    try {
      await sendVerificationEmail(user.email, user.name, token);
    } catch (emailErr) {
      console.error(
        '[resendVerification] Email failed to send:',
        emailErr.message
      );
    }

    return res.status(200).json({
      message:
        'Verification email resent successfully. Please check your inbox.',
    });
  } catch (err) {
    console.error('[resendVerification] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

/**
 * POST /api/auth/forgot-password
 * Initiates the password reset flow by sending a reset link email.
 */
export async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email address is required.',
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return generic success to prevent email enumeration attacks
    const successResponse = {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };

    if (!user) {
      return res.status(200).json(successResponse);
    }

    // Clear old reset tokens for this user
    await prisma.emailToken.deleteMany({
      where: {
        user_id: user.id,
        type: 'reset',
      },
    });

    // Create reset token (1 hour expiry)
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(
      Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    await prisma.emailToken.create({
      data: {
        user_id: user.id,
        token,
        type: 'reset',
        expires_at,
      },
    });

    // Send email
    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (emailErr) {
      console.error('[forgotPassword] Email failed to send:', emailErr.message);
    }

    return res.status(200).json(successResponse);
  } catch (err) {
    console.error('[forgotPassword] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

/**
 * POST /api/auth/reset-password
 * Resets user password given a valid reset token and new password.
 */
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Token and newPassword are required.',
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Password must be at least 8 characters long.',
    });
  }

  try {
    const record = await prisma.emailToken.findFirst({
      where: {
        token,
        type: 'reset',
      },
    });

    if (!record) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid or expired password reset token.',
      });
    }

    if (new Date() > new Date(record.expires_at)) {
      await prisma.emailToken.delete({ where: { id: record.id } });
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password reset token has expired. Please request a new one.',
      });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Transactionally update password and remove reset token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.user_id },
        data: { password_hash },
      }),
      prisma.emailToken.delete({
        where: { id: record.id },
      }),
    ]);

    return res.status(200).json({
      message:
        'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    console.error('[resetPassword] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

/**
 * GET /api/auth/me
 * Retrieves current authenticated user details using req.user from authenticateToken middleware.
 */
export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_verified: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User account not found.',
      });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('[getMe] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

/**
 * POST /api/auth/logout
 * Invalidates the current JWT by recording its JTI in the revoked-tokens blocklist.
 * Requires a valid Bearer token (authenticateToken middleware runs first).
 */
export async function logout(req, res) {
  const { jti, exp } = req.user;

  if (!jti) {
    // Token was issued before JTI support was added — just accept the logout
    return res.status(200).json({ message: 'Logged out successfully.' });
  }

  try {
    // Convert JWT `exp` (Unix seconds) to a JS Date for the row
    const expires_at = exp ? new Date(exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.revokedToken.upsert({
      where: { jti },
      update: {}, // already revoked — no-op
      create: {
        jti,
        user_id: req.user.id,
        expires_at,
      },
    });

    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('[logout] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}
