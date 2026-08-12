import { Request, Response, NextFunction } from 'express';
import { wishlistService } from '../services/wishlistService';
import { addToWishlistSchema } from '../validators/cartValidators';

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const wishlist = await wishlistService.getWishlist(userId);
    res.status(200).json({
      success: true,
      data: { wishlist },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function addToWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = addToWishlistSchema.parse(req.body);
    const wishlist = await wishlistService.addToWishlist(userId, validatedInput);
    res.status(200).json({
      success: true,
      data: { wishlist },
      message: 'Product saved to wishlist.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeWishlistItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const itemId = req.params.itemId;

    const wishlist = await wishlistService.removeWishlistItem(userId, itemId);
    res.status(200).json({
      success: true,
      data: { wishlist },
      message: 'Item removed from wishlist.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function moveWishlistItemToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const itemId = req.params.itemId;

    const wishlist = await wishlistService.moveToCart(userId, itemId);
    res.status(200).json({
      success: true,
      data: { wishlist },
      message: 'Item moved from wishlist to cart successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
