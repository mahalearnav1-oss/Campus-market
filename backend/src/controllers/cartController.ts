import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cartService';
import { addToCartSchema, updateCartItemSchema } from '../validators/cartValidators';

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const cart = await cartService.getCart(userId);
    res.status(200).json({
      success: true,
      data: { cart },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = addToCartSchema.parse(req.body);
    const cart = await cartService.addToCart(userId, validatedInput);
    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Product added to cart successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItemQuantity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const itemId = req.params.itemId;
    const validatedInput = updateCartItemSchema.parse(req.body);

    const cart = await cartService.updateCartItemQuantity(userId, itemId, validatedInput);
    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Cart item quantity updated.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const itemId = req.params.itemId;

    const cart = await cartService.removeCartItem(userId, itemId);
    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Item removed from cart.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const cart = await cartService.clearCart(userId);
    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Cart cleared successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
