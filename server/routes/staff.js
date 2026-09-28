import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { listUsers, updateUserRole } from '../controllers/userController.js';
import { getSystemStatus } from '../controllers/systemController.js';

// Developer-only tools: user/role management and system status.
const router = express.Router();
router.use(authenticateToken, requireRole('developer'));

router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/system/status', getSystemStatus);

export default router;
