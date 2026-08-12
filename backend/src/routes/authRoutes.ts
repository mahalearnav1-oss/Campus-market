import { Router } from 'express';
import { register, login, refresh, logout, getMe, devPromoteAdmin } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiting';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.post('/dev-promote-admin', requireAuth, devPromoteAdmin);

export default router;
