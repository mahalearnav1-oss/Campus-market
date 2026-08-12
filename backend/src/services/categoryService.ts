import { categoryRepository } from '../repositories/categoryRepository';
import { cacheService } from './cacheService';

export class CategoryService {
  async getAllCategories() {
    const cacheKey = 'categories:all';
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const categories = await categoryRepository.findAll();
    cacheService.set(cacheKey, categories, 600); // 10 mins TTL
    return categories;
  }

  async getCategoryBySlug(slug: string) {
    const cacheKey = `category:slug:${slug}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      const error: any = new Error('Category not found.');
      error.statusCode = 404;
      error.code = 'CATEGORY_NOT_FOUND';
      throw error;
    }

    cacheService.set(cacheKey, category, 600);
    return category;
  }
}

export const categoryService = new CategoryService();
