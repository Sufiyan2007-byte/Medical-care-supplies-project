import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  signup,
  verifyEmail,
  login,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ── Rate Limiters ──────────────────────────────────────────────────────────

/** Brute-force protection on login: max 10 attempts per 15 minutes per IP */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too Many Requests',
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/** General auth limiter: max 20 requests per 15 minutes per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Routes ─────────────────────────────────────────────────────────────────

// POST /api/auth/signup
router.post('/signup', authLimiter, signup);

// POST & GET /api/auth/verify-email
router.post('/verify-email', verifyEmail);
router.get('/verify-email', verifyEmail);

// POST /api/auth/login
router.post('/login', loginLimiter, login);

// POST /api/auth/resend-verification
router.post('/resend-verification', authLimiter, resendVerification);

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, getMe);

// POST /api/auth/logout (Protected)
router.post('/logout', authenticateToken, logout);

export default router;
