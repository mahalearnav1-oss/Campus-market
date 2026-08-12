import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/categoryService';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
      success: true,
      data: { categories },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug;
    const category = await categoryService.getCategoryBySlug(slug);
    res.status(200).json({
      success: true,
      data: { category },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
