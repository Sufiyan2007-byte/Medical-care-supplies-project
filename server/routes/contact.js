import express from 'express';
import rateLimit from 'express-rate-limit';
import { submitContactForm, listContactMessages } from '../controllers/contactController.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many messages sent from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', contactLimiter, submitContactForm);
router.get('/messages', authenticateToken, requireStaff, listContactMessages);

export default router;
