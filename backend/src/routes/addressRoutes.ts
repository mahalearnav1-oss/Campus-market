import { Router } from 'express';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/addressController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getAddresses);
router.post('/', createAddress);
router.patch('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
