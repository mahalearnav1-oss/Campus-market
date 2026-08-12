import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/reviewService';
import { createProductReviewSchema, updateProductReviewSchema, createSellerReviewSchema } from '../validators/reviewValidators';

export async function createProductReview(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const productId = req.params.id;
    const validatedInput = createProductReviewSchema.parse(req.body);

    const review = await reviewService.createProductReview(userId, productId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { review },
      message: 'Product review submitted successfully!',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.id;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const result = await reviewService.getProductReviews(productId, page, limit);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductReview(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const reviewId = req.params.reviewId;
    const validatedInput = updateProductReviewSchema.parse(req.body);

    const review = await reviewService.updateProductReview(userId, reviewId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { review },
      message: 'Product review updated.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProductReview(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const reviewId = req.params.reviewId;

    const result = await reviewService.deleteProductReview(userId, reviewId, req.ip);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function createSellerReview(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.params.id;
    const validatedInput = createSellerReviewSchema.parse(req.body);

    const review = await reviewService.createSellerReview(userId, sellerId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { review },
      message: 'Seller review submitted successfully!',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const sellerId = req.params.id;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const result = await reviewService.getSellerReviews(sellerId, page, limit);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
