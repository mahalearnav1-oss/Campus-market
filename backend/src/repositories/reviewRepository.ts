import { prisma } from '../config/prisma';
import { ReviewStatus, Prisma } from '@prisma/client';

export class ReviewRepository {
  async createProductReview(data: {
    productId: string;
    orderId: string;
    orderItemId: string;
    authorUserId: string;
    rating: number;
    title?: string;
    comment: string;
  }) {
    return prisma.productReview.create({
      data: {
        productId: data.productId,
        orderId: data.orderId,
        orderItemId: data.orderItemId,
        authorUserId: data.authorUserId,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        status: ReviewStatus.PUBLISHED,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async findProductReviewByOrderItemId(orderItemId: string) {
    return prisma.productReview.findFirst({
      where: { orderItemId },
    });
  }

  async findProductReviewById(id: string) {
    return prisma.productReview.findUnique({
      where: { id },
    });
  }

  async getProductReviews(productId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductReviewWhereInput = {
      productId,
      status: ReviewStatus.PUBLISHED,
    };

    const [total, reviews, aggregates] = await Promise.all([
      prisma.productReview.count({ where }),
      prisma.productReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      prisma.productReview.aggregate({
        where,
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const allRatings = await prisma.productReview.findMany({
      where,
      select: { rating: true },
    });
    allRatings.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      reviews,
      summary: {
        averageRating: Number(aggregates._avg.rating || 0).toFixed(1),
        totalReviews: aggregates._count.rating || 0,
        distribution,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateProductReview(id: string, data: { rating?: number; title?: string; comment?: string }) {
    return prisma.productReview.update({
      where: { id },
      data: {
        ...(data.rating !== undefined ? { rating: data.rating } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.comment !== undefined ? { comment: data.comment } : {}),
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async deleteProductReview(id: string) {
    return prisma.productReview.update({
      where: { id },
      data: { status: ReviewStatus.REMOVED },
    });
  }

  async recalculateProductRating(productId: string) {
    const agg = await prisma.productReview.aggregate({
      where: { productId, status: ReviewStatus.PUBLISHED },
      _avg: { rating: true },
    });
    // Note: Product model uses rating field if configured
    return agg._avg.rating || 0;
  }

  async createSellerReview(data: {
    sellerId: string;
    orderId: string;
    authorUserId: string;
    rating: number;
    comment: string;
  }) {
    return prisma.sellerReview.create({
      data: {
        sellerId: data.sellerId,
        orderId: data.orderId,
        authorUserId: data.authorUserId,
        rating: data.rating,
        comment: data.comment,
        status: ReviewStatus.PUBLISHED,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async findSellerReviewByOrderId(orderId: string, sellerId: string) {
    return prisma.sellerReview.findFirst({
      where: { orderId, sellerId },
    });
  }

  async getSellerReviews(sellerId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.SellerReviewWhereInput = {
      sellerId,
      status: ReviewStatus.PUBLISHED,
    };

    const [total, reviews, aggregates] = await Promise.all([
      prisma.sellerReview.count({ where }),
      prisma.sellerReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      prisma.sellerReview.aggregate({
        where,
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      reviews,
      summary: {
        averageRating: Number(aggregates._avg.rating || 0).toFixed(1),
        totalReviews: aggregates._count.rating || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async recalculateSellerRating(sellerId: string) {
    const agg = await prisma.sellerReview.aggregate({
      where: { sellerId, status: ReviewStatus.PUBLISHED },
      _avg: { rating: true },
    });
    const avgRating = agg._avg.rating || 0;

    await prisma.seller.update({
      where: { id: sellerId },
      data: { rating: new Prisma.Decimal(avgRating) },
    });

    return avgRating;
  }
}

export const reviewRepository = new ReviewRepository();
