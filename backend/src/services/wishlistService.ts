import { wishlistRepository } from '../repositories/wishlistRepository';
import { productRepository } from '../repositories/productRepository';
import { cartService } from './cartService';
import { ProductStatus } from '@prisma/client';
import { AddToWishlistInput } from '../validators/cartValidators';

export class WishlistService {
  async getWishlist(userId: string) {
    const wishlist = await wishlistRepository.getOrCreateWishlist(userId);

    const formattedItems = wishlist.items.map((item) => {
      const product = item.product;

      let isAvailable = true;
      let availabilityWarning: string | null = null;

      if (!product || product.deletedAt || product.status !== ProductStatus.ACTIVE) {
        isAvailable = false;
        availabilityWarning = 'This product is no longer active on the marketplace.';
      } else if (product.quantity <= 0) {
        isAvailable = false;
        availabilityWarning = 'This product is currently out of stock.';
      }

      return {
        id: item.id,
        productId: item.productId,
        addedAt: item.addedAt,
        isAvailable,
        availabilityWarning,
        product: {
          id: product.id,
          title: product.title,
          conditionGrade: product.conditionGrade,
          price: product.price.toString(),
          availableQuantity: product.quantity,
          status: product.status,
          images: product.images,
          category: product.category,
          seller: product.seller,
          bookDetails: product.bookDetails,
        },
      };
    });

    return {
      wishlistId: wishlist.id,
      userId: wishlist.userId,
      items: formattedItems,
      totalCount: formattedItems.length,
      updatedAt: wishlist.updatedAt,
    };
  }

  async addToWishlist(userId: string, input: AddToWishlistInput) {
    const product = await productRepository.findById(input.productId);

    if (!product) {
      const error: any = new Error('Product not found.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    const wishlist = await wishlistRepository.getOrCreateWishlist(userId);
    await wishlistRepository.addItemToWishlist(wishlist.id, input.productId);
    return this.getWishlist(userId);
  }

  async removeWishlistItem(userId: string, wishlistItemId: string) {
    const item = await wishlistRepository.findWishlistItemById(wishlistItemId);

    if (!item) {
      const error: any = new Error('Wishlist item not found.');
      error.statusCode = 404;
      error.code = 'ITEM_NOT_FOUND';
      throw error;
    }

    // Security Ownership Check: User A cannot remove User B's wishlist item
    if (item.wishlist.userId !== userId) {
      const error: any = new Error('You are not authorized to remove this wishlist item.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await wishlistRepository.removeItem(wishlistItemId);
    return this.getWishlist(userId);
  }

  async moveToCart(userId: string, wishlistItemId: string) {
    const item = await wishlistRepository.findWishlistItemById(wishlistItemId);

    if (!item) {
      const error: any = new Error('Wishlist item not found.');
      error.statusCode = 404;
      error.code = 'ITEM_NOT_FOUND';
      throw error;
    }

    if (item.wishlist.userId !== userId) {
      const error: any = new Error('You are not authorized to move this wishlist item.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const product = item.product;
    if (!product || product.deletedAt || product.status !== ProductStatus.ACTIVE || product.quantity <= 0) {
      const error: any = new Error('Cannot move item to cart because it is currently unavailable or out of stock.');
      error.statusCode = 400;
      error.code = 'PRODUCT_UNAVAILABLE';
      throw error;
    }

    // Add to cart first
    await cartService.addToCart(userId, { productId: item.productId, quantity: 1 });

    // Only remove from wishlist after successful add
    await wishlistRepository.removeItem(wishlistItemId);

    return this.getWishlist(userId);
  }
}

export const wishlistService = new WishlistService();
