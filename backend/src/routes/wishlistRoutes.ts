import { Router } from 'express';
import { getWishlist, addToWishlist, removeWishlistItem, moveWishlistItemToCart } from '../controllers/wishlistController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getWishlist);
router.post('/items', addToWishlist);
router.delete('/items/:itemId', removeWishlistItem);
router.post('/items/:itemId/move-to-cart', moveWishlistItemToCart);

export default router;
