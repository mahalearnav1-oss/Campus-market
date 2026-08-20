import { productRepository, DiscoveryOptions } from '../repositories/productRepository';
import { sellerRepository } from '../repositories/sellerRepository';
import { CreateProductInput, UpdateProductInput, ProductDiscoveryQueryInput } from '../validators/productValidators';
import { logAuditEvent } from '../utils/auditLogger';
import { ProductStatus, SellerStatus, ConditionGrade } from '@prisma/client';
import { prisma } from '../config/prisma';
import { alertService } from './alertService';

export class ProductService {
  async createProduct(userId: string, sellerId: string, collegeId: string | null, input: CreateProductInput, ipAddress?: string) {
    const seller = await sellerRepository.findById(sellerId);
    if (!seller || seller.status !== SellerStatus.VERIFIED) {
      const error: any = new Error('Your seller storefront must be approved by a campus administrator to create product listings.');
      error.statusCode = 403;
      error.code = 'SELLER_NOT_VERIFIED';
      throw error;
    }

    let targetCollegeId = collegeId;
    if (!targetCollegeId) {
      const defaultCollege = await prisma.college.findFirst();
      if (defaultCollege) {
        targetCollegeId = defaultCollege.id;
      } else {
        const createdCollege = await prisma.college.create({
          data: {
            name: 'Pimpri Chinchwad Education Trust (PCET)',
            code: 'PCET',
            domain: 'pcet.org.in',
            city: 'Pune',
            state: 'MH',
          },
        });
        targetCollegeId = createdCollege.id;
      }
      await prisma.user.update({
        where: { id: userId },
        data: { collegeId: targetCollegeId },
      });
    }

    if (!input.images || input.images.length === 0 || !input.images.some(img => img.imageUrl && img.imageUrl.trim().length > 0)) {
      const error: any = new Error('At least one clear photo of the actual product is required.');
      error.statusCode = 400;
      error.code = 'PRODUCT_IMAGE_REQUIRED';
      throw error;
    }

    const product = await productRepository.createProduct({
      sellerId,
      collegeId: targetCollegeId,
      input,
      status: ProductStatus.ACTIVE,
    });

    await logAuditEvent('PRODUCT_CREATED', 'Product', userId, product.id, { title: product.title }, ipAddress);
    return product;
  }

  async getPublicProducts(
    query: ProductDiscoveryQueryInput,
    userAcademicContext?: {
      collegeId?: string | null;
      course?: string | null;
      semester?: number | null;
    }
  ) {
    // Sanitize & Normalize Search Query
    const sanitizedQ = query.q ? query.q.trim().slice(0, 100) : undefined;

    // Validate minPrice & maxPrice bounds
    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
      const error: any = new Error('Minimum price cannot be greater than maximum price.');
      error.statusCode = 400;
      error.code = 'INVALID_PRICE_RANGE';
      throw error;
    }

    // Parse comma-separated conditions (e.g., "GOOD,LIKE_NEW")
    let conditions: ConditionGrade[] | undefined = undefined;
    if (query.condition) {
      const condList = query.condition.split(',').map((c) => c.trim().toUpperCase());
      const validConditions = Object.values(ConditionGrade);
      conditions = condList.filter((c): c is ConditionGrade => validConditions.includes(c as ConditionGrade));
    }

    const discoveryOptions: DiscoveryOptions = {
      q: sanitizedQ,
      categoryId: query.categoryId,
      categorySlugOrId: query.category,
      subcategoryId: query.subcategoryId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      conditions,
      sellerType: query.sellerType,
      collegeId: query.collegeId || query.campusId,
      branch: query.branch,
      semester: query.semester,
      forYou: query.forYou,
      userAcademicContext,
      availableOnly: query.availableOnly,
      sort: query.sort,
      page: query.page || 1,
      limit: query.limit || 24,
    };

    return productRepository.findPublishedProducts(discoveryOptions);
  }

  async getProductDetail(productId: string, requestingUserId?: string) {
    const product = await productRepository.findById(productId);
    if (!product || product.deletedAt) {
      const error: any = new Error('We couldn\'t find this product listing.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    if (product.status !== ProductStatus.ACTIVE) {
      if (!requestingUserId || product.seller.id !== (await sellerRepository.findByUserId(requestingUserId))?.id) {
        const error: any = new Error('This product listing is no longer available.');
        error.statusCode = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
      }
    }

    return product;
  }

  async getSellerProducts(userId: string, sellerId: string, page: number = 1, limit: number = 20, status?: ProductStatus) {
    return productRepository.findBySellerId(sellerId, { page, limit, status });
  }

  async updateProduct(userId: string, sellerId: string, productId: string, input: UpdateProductInput, ipAddress?: string) {
    const seller = await sellerRepository.findById(sellerId);
    if (!seller || seller.status !== SellerStatus.VERIFIED) {
      const error: any = new Error('Your seller storefront must be approved by a campus administrator to update product listings.');
      error.statusCode = 403;
      error.code = 'SELLER_NOT_VERIFIED';
      throw error;
    }

    const product = await productRepository.findById(productId);
    if (!product || product.deletedAt) {
      const error: any = new Error('We couldn\'t find this product listing.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    if (product.sellerId !== sellerId) {
      const error: any = new Error('You don\'t have permission to modify this listing.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (input.images !== undefined) {
      if (input.images.length === 0 || !input.images.some(img => img.imageUrl && img.imageUrl.trim().length > 0)) {
        const error: any = new Error('Product listing must retain at least one valid product image.');
        error.statusCode = 400;
        error.code = 'PRODUCT_IMAGE_REQUIRED';
        throw error;
      }
    }

    const oldPrice = Number(product.price);
    const oldQuantity = product.quantity;
    const oldStatus = product.status;

    const updated = await productRepository.updateProduct(productId, input);
    await logAuditEvent('PRODUCT_UPDATED', 'Product', userId, productId, { updatedFields: Object.keys(input) }, ipAddress);

    // Trigger Price Drop Alerts if price was lowered
    if (input.price !== undefined) {
      const newPrice = Number(input.price);
      if (newPrice < oldPrice) {
        await alertService.onProductPriceChanged(productId, oldPrice, newPrice, updated.title);
      }
    }

    // Trigger Availability Alerts if product became available
    const newQuantity = updated.quantity;
    const newStatus = updated.status;
    const becameAvailable =
      (oldQuantity <= 0 && newQuantity > 0 && newStatus === ProductStatus.ACTIVE) ||
      (oldStatus !== ProductStatus.ACTIVE && newStatus === ProductStatus.ACTIVE && newQuantity > 0);

    if (becameAvailable) {
      await alertService.onProductBecameAvailable(productId, updated.title);
    }

    return updated;
  }

  async publishProduct(userId: string, sellerId: string, productId: string, ipAddress?: string) {
    const seller = await sellerRepository.findById(sellerId);
    if (!seller || seller.status !== SellerStatus.VERIFIED) {
      const error: any = new Error('Your seller storefront must be approved by a campus administrator to publish product listings.');
      error.statusCode = 403;
      error.code = 'SELLER_NOT_VERIFIED';
      throw error;
    }

    const product = await productRepository.findById(productId);
    if (!product || product.deletedAt) {
      const error: any = new Error('Product listing not found.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    if (product.sellerId !== sellerId) {
      const error: any = new Error('You are not authorized to publish another seller listing.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (!product.images || product.images.length === 0) {
      const error: any = new Error('Product listing must have at least one product image before publishing.');
      error.statusCode = 400;
      error.code = 'IMAGE_REQUIRED';
      throw error;
    }

    if (!product.title || !product.description || Number(product.price) <= 0) {
      const error: any = new Error('Product title, description, and positive price are required to publish.');
      error.statusCode = 400;
      error.code = 'INCOMPLETE_PRODUCT';
      throw error;
    }

    const oldStatus = product.status;
    const published = await productRepository.updateStatus(productId, ProductStatus.ACTIVE);
    await logAuditEvent('PRODUCT_PUBLISHED', 'Product', userId, productId, {}, ipAddress);

    if (oldStatus !== ProductStatus.ACTIVE && published.quantity > 0) {
      await alertService.onProductBecameAvailable(productId, published.title);
    }

    return published;
  }

  async pauseProduct(userId: string, sellerId: string, productId: string, ipAddress?: string) {
    const product = await productRepository.findById(productId);
    if (!product || product.deletedAt) {
      const error: any = new Error('Product listing not found.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    if (product.sellerId !== sellerId) {
      const error: any = new Error('You are not authorized to pause another seller listing.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const paused = await productRepository.updateStatus(productId, ProductStatus.PAUSED);
    await logAuditEvent('PRODUCT_PAUSED', 'Product', userId, productId, {}, ipAddress);
    return paused;
  }

  async deleteProduct(userId: string, sellerId: string, productId: string, ipAddress?: string) {
    const product = await productRepository.findById(productId);
    if (!product || product.deletedAt) {
      const error: any = new Error('Product listing not found.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    if (product.sellerId !== sellerId) {
      const error: any = new Error('You are not authorized to delete another seller listing.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const archived = await productRepository.softDeleteProduct(productId);
    await logAuditEvent('PRODUCT_DELETED', 'Product', userId, productId, {}, ipAddress);
    return archived;
  }

  async addProductImage(userId: string, sellerId: string, productId: string, imageUrl: string, isPrimary: boolean = false) {
    const product = await productRepository.findById(productId);
    if (!product || product.sellerId !== sellerId) {
      const error: any = new Error('You are not authorized to add images to this product listing.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return productRepository.addImage(productId, imageUrl, isPrimary);
  }

  async setPrimaryProductImage(userId: string, sellerId: string, productId: string, imageId: string) {
    const product = await productRepository.findById(productId);
    if (!product || product.sellerId !== sellerId) {
      const error: any = new Error('You are not authorized to update images on this product listing.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return productRepository.setPrimaryImage(productId, imageId);
  }

  async deleteProductImage(userId: string, sellerId: string, productId: string, imageId: string) {
    const product = await productRepository.findById(productId);
    if (!product || product.sellerId !== sellerId) {
      const error: any = new Error('You are not authorized to delete images from this product listing.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return productRepository.deleteImage(productId, imageId);
  }
}

export const productService = new ProductService();
