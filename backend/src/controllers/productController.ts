import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService';
import { createProductSchema, updateProductSchema, productDiscoveryQuerySchema } from '../validators/productValidators';
import { ProductStatus } from '@prisma/client';

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const collegeId = req.user!.collegeId || null;
    const validatedInput = createProductSchema.parse(req.body);

    const product = await productService.createProduct(userId, sellerId, collegeId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { product },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedQuery = productDiscoveryQuerySchema.parse(req.query);
    const userAcademicContext = req.user ? {
      collegeId: req.user.collegeId,
      course: req.user.course,
      semester: req.user.semester,
    } : undefined;

    const result = await productService.getPublicProducts(validatedQuery, userAcademicContext);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.id;
    const requestingUserId = req.user?.id;
    const product = await productService.getProductDetail(productId, requestingUserId);
    res.status(200).json({
      success: true,
      data: { product },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as ProductStatus | undefined;

    const result = await productService.getSellerProducts(userId, sellerId, page, limit, status);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const productId = req.params.id;
    const validatedInput = updateProductSchema.parse(req.body);

    const updated = await productService.updateProduct(userId, sellerId, productId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { product: updated },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function publishProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const productId = req.params.id;

    const published = await productService.publishProduct(userId, sellerId, productId, req.ip);
    res.status(200).json({
      success: true,
      data: { product: published },
      message: 'Product listing successfully published to the marketplace!',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function pauseProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const productId = req.params.id;

    const paused = await productService.pauseProduct(userId, sellerId, productId, req.ip);
    res.status(200).json({
      success: true,
      data: { product: paused },
      message: 'Product listing paused.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const productId = req.params.id;

    await productService.deleteProduct(userId, sellerId, productId, req.ip);
    res.status(200).json({
      success: true,
      message: 'Product listing archived successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function addProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const productId = req.params.id;
    const { imageUrl, isPrimary } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'imageUrl is required' } });
    }

    const image = await productService.addProductImage(userId, sellerId, productId, imageUrl, isPrimary);
    res.status(201).json({
      success: true,
      data: { image },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function setPrimaryProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const { id: productId, imageId } = req.params;

    const updated = await productService.setPrimaryProductImage(userId, sellerId, productId, imageId);
    res.status(200).json({
      success: true,
      data: { image: updated },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const { id: productId, imageId } = req.params;

    await productService.deleteProductImage(userId, sellerId, productId, imageId);
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
