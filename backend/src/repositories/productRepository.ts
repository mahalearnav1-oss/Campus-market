import { prisma } from '../config/prisma';
import { ProductStatus, ConditionGrade, SellerType, Prisma } from '@prisma/client';
import { CreateProductInput, UpdateProductInput } from '../validators/productValidators';

export interface DiscoveryOptions {
  q?: string;
  categoryId?: string;
  categorySlugOrId?: string;
  subcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  conditions?: ConditionGrade[];
  sellerType?: SellerType;
  collegeId?: string;
  availableOnly?: boolean;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'recently_updated';
  page: number;
  limit: number;
}

export class ProductRepository {
  async createProduct(data: {
    sellerId: string;
    collegeId: string;
    input: CreateProductInput;
    status?: ProductStatus;
  }) {
    const { sellerId, collegeId, input, status = ProductStatus.DRAFT } = data;

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sellerId,
          collegeId,
          categoryId: input.categoryId,
          subcategoryId: input.subcategoryId || null,
          title: input.title,
          description: input.description,
          conditionGrade: input.conditionGrade,
          conditionNotes: input.conditionNotes,
          price: new Prisma.Decimal(input.price),
          originalMsrp: input.originalMsrp ? new Prisma.Decimal(input.originalMsrp) : null,
          quantity: input.quantity || 1,
          status,
          allowedFulfillments: input.allowedFulfillments || 'CAMPUS_MEETUP,COURIER_SHIPPING',
          ...(input.bookDetails ? {
            bookDetails: {
              create: {
                isbn13: input.bookDetails.isbn13 || null,
                isbn10: input.bookDetails.isbn10 || null,
                author: input.bookDetails.author,
                publisher: input.bookDetails.publisher || null,
                edition: input.bookDetails.edition || null,
                courseCode: input.bookDetails.courseCode || null,
              },
            },
          } : {}),
          ...(input.images && input.images.length > 0 ? {
            images: {
              create: input.images.map((img, idx) => ({
                imageUrl: img.imageUrl,
                isPrimary: img.isPrimary || idx === 0,
                displayOrder: img.displayOrder || idx + 1,
              })),
            },
          } : {}),
        },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          bookDetails: true,
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, storeName: true, sellerType: true, rating: true } },
        },
      });

      return product;
    });
  }

  async findPublishedProducts(options: DiscoveryOptions) {
    const {
      q,
      categoryId,
      categorySlugOrId,
      subcategoryId,
      minPrice,
      maxPrice,
      conditions,
      sellerType,
      collegeId,
      availableOnly,
      sort = 'newest',
      page = 1,
      limit = 24,
    } = options;

    const skip = (page - 1) * limit;

    // Build Prisma Where Clause
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
      ...(availableOnly ? { quantity: { gt: 0 } } : {}),
      ...(subcategoryId ? { subcategoryId } : {}),
    };

    if (collegeId && collegeId !== 'all' && collegeId !== 'default-pcet-uuid') {
      where.OR = [
        { collegeId },
        { college: { code: collegeId } },
      ];
    }

    // Category Filter (support categoryId or categorySlugOrId)
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlugOrId) {
      where.category = {
        OR: [{ id: categorySlugOrId }, { slug: categorySlugOrId }],
      };
    }

    // Price Range Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined ? { gte: new Prisma.Decimal(minPrice) } : {}),
        ...(maxPrice !== undefined ? { lte: new Prisma.Decimal(maxPrice) } : {}),
      };
    }

    // Condition Grade Filter
    if (conditions && conditions.length > 0) {
      where.conditionGrade = { in: conditions };
    }

    // Seller Type Filter
    if (sellerType) {
      where.seller = { sellerType };
    }

    // Multi-term Search Parameter (q)
    if (q && q.trim().length > 0) {
      const searchTerm = q.trim();
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { bookDetails: { author: { contains: searchTerm } } },
        { bookDetails: { isbn13: { contains: searchTerm } } },
        { bookDetails: { isbn10: { contains: searchTerm } } },
        { bookDetails: { courseCode: { contains: searchTerm } } },
      ];
    }

    // Sorting Whitelist
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'recently_updated') {
      orderBy = { updatedAt: 'desc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          bookDetails: true,
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          college: { select: { id: true, name: true, code: true } },
          seller: { select: { id: true, storeName: true, sellerType: true, rating: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products,
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

  async findById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        bookDetails: true,
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        college: { select: { id: true, name: true, code: true } },
        seller: {
          select: {
            id: true,
            storeName: true,
            sellerType: true,
            rating: true,
            totalSalesCount: true,
            status: true,
            createdAt: true,
            user: { select: { firstName: true, lastName: true, avatarUrl: true, college: true } },
          },
        },
      },
    });
  }

  async findBySellerId(sellerId: string, options: { page: number; limit: number; status?: ProductStatus }) {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      sellerId,
      deletedAt: null,
      ...(status ? { status } : {}),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          bookDetails: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateProduct(productId: string, input: UpdateProductInput) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          ...(input.subcategoryId !== undefined ? { subcategoryId: input.subcategoryId } : {}),
          ...(input.title ? { title: input.title } : {}),
          ...(input.description ? { description: input.description } : {}),
          ...(input.conditionGrade ? { conditionGrade: input.conditionGrade } : {}),
          ...(input.conditionNotes ? { conditionNotes: input.conditionNotes } : {}),
          ...(input.price !== undefined ? { price: new Prisma.Decimal(input.price) } : {}),
          ...(input.originalMsrp !== undefined ? { originalMsrp: input.originalMsrp ? new Prisma.Decimal(input.originalMsrp) : null } : {}),
          ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
          ...(input.allowedFulfillments ? { allowedFulfillments: input.allowedFulfillments } : {}),
        },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          bookDetails: true,
          category: true,
        },
      });

      if (input.bookDetails) {
        await tx.bookDetails.upsert({
          where: { productId },
          create: {
            productId,
            isbn13: input.bookDetails.isbn13 || null,
            isbn10: input.bookDetails.isbn10 || null,
            author: input.bookDetails.author || 'Unknown',
            publisher: input.bookDetails.publisher || null,
            edition: input.bookDetails.edition || null,
            courseCode: input.bookDetails.courseCode || null,
          },
          update: {
            ...(input.bookDetails.isbn13 !== undefined ? { isbn13: input.bookDetails.isbn13 } : {}),
            ...(input.bookDetails.isbn10 !== undefined ? { isbn10: input.bookDetails.isbn10 } : {}),
            ...(input.bookDetails.author ? { author: input.bookDetails.author } : {}),
            ...(input.bookDetails.publisher !== undefined ? { publisher: input.bookDetails.publisher } : {}),
            ...(input.bookDetails.edition !== undefined ? { edition: input.bookDetails.edition } : {}),
            ...(input.bookDetails.courseCode !== undefined ? { courseCode: input.bookDetails.courseCode } : {}),
          },
        });
      }

      return updated;
    });
  }

  async updateStatus(productId: string, status: ProductStatus) {
    return prisma.product.update({
      where: { id: productId },
      data: { status },
    });
  }

  async softDeleteProduct(productId: string) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        status: ProductStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });
  }

  async addImage(productId: string, imageUrl: string, isPrimary: boolean = false) {
    return prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.productImage.updateMany({
          where: { productId },
          data: { isPrimary: false },
        });
      }

      const existingCount = await tx.productImage.count({ where: { productId } });

      return tx.productImage.create({
        data: {
          productId,
          imageUrl,
          isPrimary: isPrimary || existingCount === 0,
          displayOrder: existingCount + 1,
        },
      });
    });
  }

  async setPrimaryImage(productId: string, imageId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });

      return tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });
  }

  async deleteImage(productId: string, imageId: string) {
    return prisma.$transaction(async (tx) => {
      const img = await tx.productImage.findUnique({ where: { id: imageId } });
      if (!img) return null;

      await tx.productImage.delete({ where: { id: imageId } });

      if (img.isPrimary) {
        const remaining = await tx.productImage.findFirst({
          where: { productId },
          orderBy: { displayOrder: 'asc' },
        });
        if (remaining) {
          await tx.productImage.update({
            where: { id: remaining.id },
            data: { isPrimary: true },
          });
        }
      }

      return img;
    });
  }
}

export const productRepository = new ProductRepository();
