import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:idOrSlug/related', getRelatedProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);

// Admin protected routes
router.post('/', authenticateAdmin, createProduct);
router.put('/:id', authenticateAdmin, updateProduct);
router.delete('/:id', authenticateAdmin, deleteProduct);

export default router;
