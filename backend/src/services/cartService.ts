import { cartRepository } from '../repositories/cartRepository';
import { productRepository } from '../repositories/productRepository';
import { Prisma, ProductStatus } from '@prisma/client';
import { AddToCartInput, UpdateCartItemInput } from '../validators/cartValidators';

export class CartService {
  async getCart(userId: string) {
    const cart = await cartRepository.getOrCreateCart(userId);

    let subtotal = new Prisma.Decimal(0);
    let totalItemCount = 0;

    const formattedItems = cart.items.map((item) => {
      const product = item.product;
      const unitPrice = new Prisma.Decimal(product.price);
      const lineTotal = unitPrice.mul(item.quantity);

      // Check Stale / Availability Warnings
      let isAvailable = true;
      let availabilityWarning: string | null = null;

      if (!product || product.deletedAt || product.status !== ProductStatus.ACTIVE) {
        isAvailable = false;
        availabilityWarning = 'This item is no longer active or available on the marketplace.';
      } else if (product.quantity <= 0) {
        isAvailable = false;
        availabilityWarning = 'This item is currently out of stock.';
      } else if (item.quantity > product.quantity) {
        isAvailable = false;
        availabilityWarning = `Only ${product.quantity} unit(s) are currently available in stock.`;
      }

      if (isAvailable) {
        subtotal = subtotal.add(lineTotal);
        totalItemCount += item.quantity;
      }

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        unitPrice: unitPrice.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
        isAvailable,
        availabilityWarning,
        product: {
          id: product.id,
          title: product.title,
          conditionGrade: product.conditionGrade,
          price: unitPrice.toFixed(2),
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
      cartId: cart.id,
      userId: cart.userId,
      items: formattedItems,
      subtotal: subtotal.toFixed(2),
      totalItemCount,
      updatedAt: cart.updatedAt,
    };
  }

  async addToCart(userId: string, input: AddToCartInput) {
    const product = await productRepository.findById(input.productId);

    if (!product || product.deletedAt || product.status !== ProductStatus.ACTIVE) {
      const error: any = new Error('This product is not active or available for purchase.');
      error.statusCode = 400;
      error.code = 'INACTIVE_PRODUCT';
      throw error;
    }

    if (product.quantity <= 0) {
      const error: any = new Error('This product is currently out of stock.');
      error.statusCode = 400;
      error.code = 'OUT_OF_STOCK';
      throw error;
    }

    const cart = await cartRepository.getOrCreateCart(userId);
    const existingItem = cart.items.find((i) => i.productId === input.productId);
    const newRequestedQuantity = (existingItem?.quantity || 0) + input.quantity;

    if (newRequestedQuantity > product.quantity) {
      const error: any = new Error(`Cannot add ${input.quantity} unit(s). Total requested (${newRequestedQuantity}) exceeds available stock (${product.quantity}).`);
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    await cartRepository.addItemToCart(cart.id, input.productId, input.quantity);
    return this.getCart(userId);
  }

  async updateCartItemQuantity(userId: string, cartItemId: string, input: UpdateCartItemInput) {
    const cartItem = await cartRepository.findCartItemById(cartItemId);

    if (!cartItem) {
      const error: any = new Error('Cart item not found.');
      error.statusCode = 404;
      error.code = 'ITEM_NOT_FOUND';
      throw error;
    }

    // Security Ownership Check: User A cannot modify User B's cart item
    if (cartItem.cart.userId !== userId) {
      const error: any = new Error('You are not authorized to modify this cart item.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (input.quantity > cartItem.product.quantity) {
      const error: any = new Error(`Requested quantity (${input.quantity}) exceeds available stock (${cartItem.product.quantity}).`);
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    await cartRepository.updateItemQuantity(cartItemId, input.quantity);
    return this.getCart(userId);
  }

  async removeCartItem(userId: string, cartItemId: string) {
    const cartItem = await cartRepository.findCartItemById(cartItemId);

    if (!cartItem) {
      const error: any = new Error('Cart item not found.');
      error.statusCode = 404;
      error.code = 'ITEM_NOT_FOUND';
      throw error;
    }

    // Security Ownership Check: User A cannot remove User B's cart item
    if (cartItem.cart.userId !== userId) {
      const error: any = new Error('You are not authorized to remove this cart item.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await cartRepository.removeItem(cartItemId);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await cartRepository.getOrCreateCart(userId);
    await cartRepository.clearCart(cart.id);
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
