import { Router } from 'express';
import {
  createProduct,
  getPublicProducts,
  getProductDetail,
  getSellerProducts,
  updateProduct,
  publishProduct,
  pauseProduct,
  deleteProduct,
  addProductImage,
  setPrimaryProductImage,
  deleteProductImage,
} from '../controllers/productController';
import { requireAuth, requireSeller } from '../middleware/authMiddleware';

const router = Router();

// Public Product APIs
router.get('/', getPublicProducts);
router.get('/:id', getProductDetail);

// Authenticated Seller Product APIs
router.get('/seller/me', requireAuth, requireSeller, getSellerProducts);
router.post('/', requireAuth, requireSeller, createProduct);
router.patch('/:id', requireAuth, requireSeller, updateProduct);
router.delete('/:id', requireAuth, requireSeller, deleteProduct);
router.post('/:id/publish', requireAuth, requireSeller, publishProduct);
router.post('/:id/pause', requireAuth, requireSeller, pauseProduct);

// Product Image Management APIs
router.post('/:id/images', requireAuth, requireSeller, addProductImage);
router.patch('/:id/images/:imageId', requireAuth, requireSeller, setPrimaryProductImage);
router.delete('/:id/images/:imageId', requireAuth, requireSeller, deleteProductImage);

export default router;
