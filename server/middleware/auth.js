import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

/** Roles that may use the staff panel. */
export const STAFF_ROLES = ['admin', 'developer'];
export const ALL_ROLES = ['user', 'admin', 'developer'];

/**
 * Middleware to authenticate requests using a JWT Bearer token.
 * Attaches the decoded user payload ({ id, email, name, role, jti }) to req.user.
 * Also checks the revoked-tokens blocklist for logged-out tokens.
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message:
        'Access token missing or malformed. Standard format: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me_in_prod';

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    console.error('[authenticateToken] JWT verification error:', err.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired access token.',
    });
  }

  // Check blocklist: reject tokens that have been explicitly revoked via logout
  if (decoded.jti) {
    try {
      const revoked = await prisma.revokedToken.findUnique({
        where: { jti: decoded.jti },
      });
      if (revoked) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has been revoked. Please log in again.',
        });
      }
    } catch (dbErr) {
      console.error('[authenticateToken] Blocklist check failed:', dbErr.message);
      // Fail open with a warning — don't block legitimate users on DB errors
    }
  }

  // Always use the CURRENT role from the database, not the one baked into the token,
  // so promoting or demoting someone takes effect immediately.
  try {
    const account = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true },
    });
    if (!account) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Account no longer exists.' });
    }
    decoded.role = account.role;
  } catch (dbErr) {
    console.error('[authenticateToken] Role lookup failed:', dbErr.message);
    // keep the token's role on DB errors
  }

  req.user = decoded;
  next();
}

/**
 * Middleware factory to enforce role-based authorization.
 * Usage: requireRole('admin') or requireRole('admin', 'doctor')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
}

/** Shortcut: admin or developer. */
export const requireStaff = requireRole(...STAFF_ROLES);
