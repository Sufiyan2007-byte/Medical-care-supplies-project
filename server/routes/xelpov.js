import express from 'express';
import {
  listXelpovProducts,
  getXelpovMeta,
  getXelpovProduct,
  createXelpovProduct,
  updateXelpovProduct,
  deleteXelpovProduct,
} from '../controllers/xelpovController.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';

const router = express.Router();

// Read (admin panel listing — public read is unnecessary since the storefront
// reads the static JSON file directly, but staff auth guards all of it here
// to keep this endpoint admin-only rather than exposing a second public API).
router.get('/products', authenticateToken, requireStaff, listXelpovProducts);
router.get('/meta', authenticateToken, requireStaff, getXelpovMeta);
router.get('/products/:slug', authenticateToken, requireStaff, getXelpovProduct);

// Write
router.post('/products', authenticateToken, requireStaff, createXelpovProduct);
router.put('/products/:slug', authenticateToken, requireStaff, updateXelpovProduct);
router.delete('/products/:slug', authenticateToken, requireStaff, deleteXelpovProduct);

export default router;
