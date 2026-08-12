import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, updateProfile);
router.patch('/me/password', requireAuth, changePassword);

export default router;
