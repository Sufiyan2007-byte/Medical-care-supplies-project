import express from 'express';
import {
  getCategories,
  getCategoryById,
  getProducts,
  getProductById,
  getSurgicalSets,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Categories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);

// Products (Public read)
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Products (Admin write)
router.post('/products', authenticateToken, requireRole('admin'), createProduct);
router.put('/products/:id', authenticateToken, requireRole('admin'), updateProduct);
router.delete('/products/:id', authenticateToken, requireRole('admin'), deleteProduct);

// Surgical Sets
router.get('/sets', getSurgicalSets);
router.get('/sets/:id', getProductById);

export default router;
