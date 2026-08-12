import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/preferencesController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getPreferences);
router.patch('/', updatePreferences);

export default router;
