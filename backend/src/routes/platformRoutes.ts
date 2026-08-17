import { Router } from 'express';
import { getPlatformStats } from '../controllers/platformController';

const router = Router();

// Public platform statistics route
router.get('/stats', getPlatformStats);

export default router;
