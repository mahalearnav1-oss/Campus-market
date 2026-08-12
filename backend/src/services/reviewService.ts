import { reviewRepository } from '../repositories/reviewRepository';
import { prisma } from '../config/prisma';
import { CreateProductReviewInput, UpdateProductReviewInput, CreateSellerReviewInput } from '../validators/reviewValidators';
import { logAuditEvent } from '../utils/auditLogger';
import { OrderStatus, NotificationType } from '@prisma/client';
import { notificationService } from './notificationService';

export class ReviewService {
  async createProductReview(userId: string, productId: string, input: CreateProductReviewInput, ipAddress?: string) {
    // 1. Purchase Verification: OrderItem must exist, belong to user, match productId, and order must be COMPLETED or delivered
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: input.orderItemId },
      include: { order: true },
    });

    if (!orderItem || orderItem.order.buyerId !== userId || orderItem.productId !== productId) {
      const error: any = new Error('You can only review products you have purchased.');
      error.statusCode = 403;
      error.code = 'PURCHASE_VERIFICATION_FAILED';
      throw error;
    }

    if (orderItem.order.status !== OrderStatus.COMPLETED) {
      const error: any = new Error('Product reviews can only be submitted for delivered and completed orders.');
      error.statusCode = 400;
      error.code = 'ORDER_NOT_DELIVERED';
      throw error;
    }

    // 2. Limit Check: Exactly 1 review per OrderItem
    const existing = await reviewRepository.findProductReviewByOrderItemId(input.orderItemId);
    if (existing) {
      const error: any = new Error('You have already submitted a review for this purchased item.');
      error.statusCode = 400;
      error.code = 'DUPLICATE_REVIEW';
      throw error;
    }

    const review = await reviewRepository.createProductReview({
      productId,
      orderId: orderItem.orderId,
      orderItemId: input.orderItemId,
      authorUserId: userId,
      rating: input.rating,
      title: input.title,
      comment: input.comment,
    });

    await reviewRepository.recalculateProductRating(productId);

    // Notify Seller
    if (orderItem.sellerId) {
      const seller = await prisma.seller.findUnique({ where: { id: orderItem.sellerId } });
      if (seller) {
        await notificationService.notifyUser({
          userId: seller.userId,
          type: NotificationType.REVIEW_RECEIVED,
          title: `⭐ New Product Review (${input.rating}/5)`,
          body: `A verified buyer left a ${input.rating}-star review on "${orderItem.snapshotTitle}".`,
          data: { productId, rating: input.rating },
          actionUrl: `/products/${productId}`,
        });
      }
    }

    await logAuditEvent('PRODUCT_REVIEW_CREATED', 'ProductReview', userId, review.id, { productId, rating: input.rating }, ipAddress);
    return review;
  }

  async getProductReviews(productId: string, page: number = 1, limit: number = 10) {
    return reviewRepository.getProductReviews(productId, { page, limit });
  }

  async updateProductReview(userId: string, reviewId: string, input: UpdateProductReviewInput, ipAddress?: string) {
    const review = await reviewRepository.findProductReviewById(reviewId);

    if (!review || review.authorUserId !== userId) {
      const error: any = new Error('Review not found or unauthorized.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const updated = await reviewRepository.updateProductReview(reviewId, input);
    await reviewRepository.recalculateProductRating(review.productId);
    await logAuditEvent('PRODUCT_REVIEW_UPDATED', 'ProductReview', userId, reviewId, { rating: input.rating }, ipAddress);
    return updated;
  }

  async deleteProductReview(userId: string, reviewId: string, ipAddress?: string) {
    const review = await reviewRepository.findProductReviewById(reviewId);

    if (!review || review.authorUserId !== userId) {
      const error: any = new Error('Review not found or unauthorized.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await reviewRepository.deleteProductReview(reviewId);
    await reviewRepository.recalculateProductRating(review.productId);
    await logAuditEvent('PRODUCT_REVIEW_DELETED', 'ProductReview', userId, reviewId, {}, ipAddress);
    return { success: true, message: 'Review deleted successfully.' };
  }

  async createSellerReview(userId: string, sellerId: string, input: CreateSellerReviewInput, ipAddress?: string) {
    // Verified Purchase Check: Order must belong to user, match sellerId, and status COMPLETED
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: { items: true },
    });

    if (!order || order.buyerId !== userId) {
      const error: any = new Error('You can only review sellers you have completed an order with.');
      error.statusCode = 403;
      error.code = 'PURCHASE_VERIFICATION_FAILED';
      throw error;
    }

    const sellerMatch = order.sellerId === sellerId || order.items.some((i) => i.sellerId === sellerId);
    if (!sellerMatch) {
      const error: any = new Error('Selected order does not contain items from this seller.');
      error.statusCode = 400;
      error.code = 'SELLER_MISMATCH';
      throw error;
    }

    if (order.status !== OrderStatus.COMPLETED) {
      const error: any = new Error('Seller reviews can only be submitted for completed orders.');
      error.statusCode = 400;
      error.code = 'ORDER_NOT_DELIVERED';
      throw error;
    }

    // Limit Check: 1 seller review per order
    const existing = await reviewRepository.findSellerReviewByOrderId(input.orderId, sellerId);
    if (existing) {
      const error: any = new Error('You have already reviewed this seller for this order.');
      error.statusCode = 400;
      error.code = 'DUPLICATE_REVIEW';
      throw error;
    }

    const review = await reviewRepository.createSellerReview({
      sellerId,
      orderId: input.orderId,
      authorUserId: userId,
      rating: input.rating,
      comment: input.comment,
    });

    await reviewRepository.recalculateSellerRating(sellerId);
    await logAuditEvent('SELLER_REVIEW_CREATED', 'SellerReview', userId, review.id, { sellerId, rating: input.rating }, ipAddress);
    return review;
  }

  async getSellerReviews(sellerId: string, page: number = 1, limit: number = 10) {
    return reviewRepository.getSellerReviews(sellerId, { page, limit });
  }
}

export const reviewService = new ReviewService();
