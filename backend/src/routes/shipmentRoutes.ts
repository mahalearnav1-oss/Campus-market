import { Router } from 'express';
import {
  createShipment,
  updateShipmentStatus,
  getBuyerTracking,
  getPublicTracking,
  getSellerShipments,
  confirmBuyerDelivery,
} from '../controllers/shipmentController';
import { requireAuth, requireSeller } from '../middleware/authMiddleware';

const router = Router();

// Public Safe Tracking (No Authentication Required)
router.get('/track/:shipmentNumber', getPublicTracking);

// Buyer Authenticated Tracking & Delivery Confirmation
router.get('/orders/:orderNumber/tracking', requireAuth, getBuyerTracking);
router.post('/orders/:orderNumber/confirm-delivery', requireAuth, confirmBuyerDelivery);

// Seller Authenticated Shipment Management
router.post('/sellers/orders/:orderItemId/shipment', requireAuth, requireSeller, createShipment);
router.patch('/sellers/shipments/:shipmentId/status', requireAuth, requireSeller, updateShipmentStatus);
router.get('/sellers/me/shipments', requireAuth, requireSeller, getSellerShipments);

export default router;
