import { Router } from 'express';
import { alertController } from '../controllers/alertController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Price Alerts for specific product
router.post('/products/:productId/price-alert', requireAuth, (req, res, next) => alertController.setPriceAlert(req, res, next));
router.get('/products/:productId/price-alert', requireAuth, (req, res, next) => alertController.getPriceAlert(req, res, next));
router.delete('/products/:productId/price-alert', requireAuth, (req, res, next) => alertController.deletePriceAlert(req, res, next));

// Availability / Back-in-Stock Alerts for specific product
router.post('/products/:productId/availability-alert', requireAuth, (req, res, next) => alertController.setAvailabilityAlert(req, res, next));
router.get('/products/:productId/availability-alert', requireAuth, (req, res, next) => alertController.getAvailabilityAlert(req, res, next));
router.delete('/products/:productId/availability-alert', requireAuth, (req, res, next) => alertController.deleteAvailabilityAlert(req, res, next));

// User active price alerts list
router.get('/price-alerts', requireAuth, (req, res, next) => alertController.getUserPriceAlerts(req, res, next));

export default router;
