import { prisma } from '../config/prisma';

export class CartRepository {
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { addedAt: 'desc' },
          include: {
            product: {
              include: {
                images: { orderBy: { displayOrder: 'asc' } },
                category: { select: { id: true, name: true, slug: true } },
                seller: { select: { id: true, storeName: true, sellerType: true, rating: true } },
                bookDetails: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            orderBy: { addedAt: 'desc' },
            include: {
              product: {
                include: {
                  images: { orderBy: { displayOrder: 'asc' } },
                  category: { select: { id: true, name: true, slug: true } },
                  seller: { select: { id: true, storeName: true, sellerType: true, rating: true } },
                  bookDetails: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  async findCartItemById(cartItemId: string) {
    return prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: { select: { id: true, userId: true } },
        product: true,
      },
    });
  }

  async addItemToCart(cartId: string, productId: string, quantity: number) {
    // Check if item already exists in user's cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });

    if (existingItem) {
      // Increment existing quantity
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: { product: true },
      });
    }

    // Create new cart item row
    return prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
      },
      include: { product: true },
    });
  }

  async updateItemQuantity(cartItemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    });
  }

  async removeItem(cartItemId: string) {
    return prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}

export const cartRepository = new CartRepository();
