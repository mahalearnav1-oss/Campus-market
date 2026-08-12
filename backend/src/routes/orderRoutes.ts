import { Router } from 'express';
import {
  getCheckoutPreview,
  createOrder,
  getBuyerOrders,
  getOrderByNumber,
  cancelOrder,
  getSellerOrders,
  updateSellerOrderStatus,
} from '../controllers/orderController';
import { requireAuth, requireSeller } from '../middleware/authMiddleware';

const router = Router();

// Checkout Preview & Order Creation (Buyer Authenticated)
router.get('/checkout', requireAuth, getCheckoutPreview);
router.post('/orders', requireAuth, createOrder);

// Buyer Order History & Detail
router.get('/orders', requireAuth, getBuyerOrders);
router.get('/orders/:orderNumber', requireAuth, getOrderByNumber);
router.post('/orders/:orderNumber/cancel', requireAuth, cancelOrder);

// Seller Order Management
router.get('/sellers/me/orders', requireAuth, requireSeller, getSellerOrders);
router.patch('/sellers/me/orders/:orderItemId/status', requireAuth, requireSeller, updateSellerOrderStatus);

export default router;
