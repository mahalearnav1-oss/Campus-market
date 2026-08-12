import { Router } from 'express';
import { applySeller, getMySeller, getSellerStatus, updateMySeller, submitVerification, getPublicSeller } from '../controllers/sellerController';
import { requireAuth, requireSeller } from '../middleware/authMiddleware';

const router = Router();

// Public Seller Profile API
router.get('/:id', getPublicSeller);

// Authenticated Seller Registration Endpoints (aliases for /apply and /register)
router.post('/apply', requireAuth, applySeller);
router.post('/register', requireAuth, applySeller);

// Authenticated Seller Endpoints
router.get('/me', requireAuth, requireSeller, getMySeller);
router.patch('/me', requireAuth, requireSeller, updateMySeller);
router.get('/me/status', requireAuth, requireSeller, getSellerStatus);
router.post('/me/verification', requireAuth, requireSeller, submitVerification);

export default router;
