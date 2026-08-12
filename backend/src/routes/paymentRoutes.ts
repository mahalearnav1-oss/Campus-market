import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  retryPayment,
  getPaymentStatus,
} from '../controllers/paymentController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Webhook (Public with Razorpay HMAC Signature verification)
router.post('/webhook', handleWebhook);

// Authenticated Buyer Payment Endpoints
router.post('/create-order', requireAuth, createPaymentOrder);
router.post('/verify', requireAuth, verifyPayment);
router.post('/retry', requireAuth, retryPayment);
router.get('/:orderNumber', requireAuth, getPaymentStatus);

export default router;
