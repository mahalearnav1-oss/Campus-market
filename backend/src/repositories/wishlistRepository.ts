import { prisma } from '../config/prisma';

export class WishlistRepository {
  async getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
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

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
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

    return wishlist;
  }

  async findWishlistItemById(wishlistItemId: string) {
    return prisma.wishlistItem.findUnique({
      where: { id: wishlistItemId },
      include: {
        wishlist: { select: { id: true, userId: true } },
        product: true,
      },
    });
  }

  async addItemToWishlist(wishlistId: string, productId: string) {
    // Check if item already exists in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId,
          productId,
        },
      },
      include: { product: true },
    });

    if (existing) return existing;

    return prisma.wishlistItem.create({
      data: {
        wishlistId,
        productId,
      },
      include: { product: true },
    });
  }

  async removeItem(wishlistItemId: string) {
    return prisma.wishlistItem.delete({
      where: { id: wishlistItemId },
    });
  }
}

export const wishlistRepository = new WishlistRepository();
