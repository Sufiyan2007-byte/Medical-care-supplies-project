import express from 'express';
import {
  getCategories,
  getCategoryById,
  getProducts,
  getProductById,
  getLowStockProducts,
  getProductSpecSheet,
  getSurgicalSets,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';

const router = express.Router();

// Categories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);

// Products (Public read)
router.get('/products', getProducts);
// Must be registered before '/products/:id' or Express would treat "low-stock" as an :id.
router.get('/products/low-stock', authenticateToken, requireStaff, getLowStockProducts);
router.get('/products/:id', getProductById);
router.get('/products/:id/spec-sheet.pdf', getProductSpecSheet);

// Products (Admin write)
router.post('/products', authenticateToken, requireStaff, createProduct);
router.put('/products/:id', authenticateToken, requireStaff, updateProduct);
router.delete('/products/:id', authenticateToken, requireStaff, deleteProduct);

// Surgical Sets
router.get('/sets', getSurgicalSets);
router.get('/sets/:id', getProductById);

export default router;
