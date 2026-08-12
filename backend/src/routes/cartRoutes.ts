import { Router } from 'express';
import { getCart, addToCart, updateCartItemQuantity, removeCartItem, clearCart } from '../controllers/cartController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items/:itemId', updateCartItemQuantity);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router;
