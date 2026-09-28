import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAccount, updateAccount } from '../controllers/accountController.js';

const router = express.Router();
router.get('/', authenticateToken, getAccount);
router.patch('/', authenticateToken, updateAccount);

export default router;
