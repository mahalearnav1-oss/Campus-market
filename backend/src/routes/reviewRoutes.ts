import { Router } from 'express';
import {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  createSellerReview,
  getSellerReviews,
} from '../controllers/reviewController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Product Reviews
router.get('/products/:id/reviews', getProductReviews);
router.post('/products/:id/reviews', requireAuth, createProductReview);
router.patch('/products/:id/reviews/:reviewId', requireAuth, updateProductReview);
router.delete('/products/:id/reviews/:reviewId', requireAuth, deleteProductReview);

// Seller Reviews
router.get('/sellers/:id/reviews', getSellerReviews);
router.post('/sellers/:id/reviews', requireAuth, createSellerReview);

export default router;
