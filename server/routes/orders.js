import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { authenticateToken, requireStaff } from '../middleware/auth.js';
import {
  createOrder,
  getMyOrders,
  listOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = express.Router();

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many orders from this IP, please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Guests can order; if a valid token is sent, the order is linked to that account. */
function optionalAuth(req, _res, next) {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET || 'dev_jwt_secret_change_me_in_prod');
    } catch {
      /* ignore — treated as guest */
    }
  }
  next();
}

router.post('/', orderLimiter, optionalAuth, createOrder);
router.get('/mine', authenticateToken, getMyOrders);
router.get('/', authenticateToken, requireStaff, listOrders);
router.patch('/:id/status', authenticateToken, requireStaff, updateOrderStatus);

export default router;
