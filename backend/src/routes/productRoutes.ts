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
import { requireAuth, requireSeller, requireVerifiedSeller, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// Public Product APIs
router.get('/', optionalAuth, getPublicProducts);
router.get('/:id', optionalAuth, getProductDetail);

// Authenticated Seller Product APIs
router.get('/seller/me', requireAuth, requireSeller, getSellerProducts);
router.post('/', requireAuth, requireVerifiedSeller, createProduct);
router.patch('/:id', requireAuth, requireVerifiedSeller, updateProduct);
router.delete('/:id', requireAuth, requireVerifiedSeller, deleteProduct);
router.post('/:id/publish', requireAuth, requireVerifiedSeller, publishProduct);
router.post('/:id/pause', requireAuth, requireVerifiedSeller, pauseProduct);

// Product Image Management APIs
router.post('/:id/images', requireAuth, requireVerifiedSeller, addProductImage);
router.patch('/:id/images/:imageId', requireAuth, requireVerifiedSeller, setPrimaryProductImage);
router.delete('/:id/images/:imageId', requireAuth, requireVerifiedSeller, deleteProductImage);

export default router;
