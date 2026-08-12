import { prisma } from '../config/prisma';

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        subcategories: { orderBy: { name: 'asc' } },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: { orderBy: { name: 'asc' } },
      },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { subcategories: true },
    });
  }
}

export const categoryRepository = new CategoryRepository();
