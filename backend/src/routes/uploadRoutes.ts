import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Authenticated image upload endpoint
router.post('/', requireAuth, uploadImage);

export default router;
