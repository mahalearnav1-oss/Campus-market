import { adminRepository } from '../repositories/adminRepository';
import { prisma } from '../config/prisma';
import { logAuditEvent } from '../utils/auditLogger';
import { notificationService } from './notificationService';
import {
  UpdateUserStatusInput,
  VerifySellerInput,
  UpdateProductStatusInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateReportInput,
  ResolveReportInput,
  CreateDisputeInput,
  ResolveDisputeInput,
} from '../validators/adminValidators';
import { UserStatus, SellerStatus, ProductStatus, ReportStatus, DisputeStatus, NotificationType } from '@prisma/client';

export class AdminService {
  async getDashboardAnalytics() {
    return adminRepository.getDashboardMetrics();
  }

  async getUsers(page: number = 1, limit: number = 20, search?: string, status?: UserStatus, role?: string) {
    return adminRepository.getUsers({ page, limit, search, status, role });
  }

  async updateUserStatus(adminUserId: string, userId: string, input: UpdateUserStatusInput, ipAddress?: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: input.status as UserStatus },
    });

    await logAuditEvent('USER_STATUS_UPDATED', 'User', adminUserId, userId, { newStatus: input.status, reason: input.reason }, ipAddress);
    return updatedUser;
  }

  async getSellers(page: number = 1, limit: number = 20, status?: SellerStatus, search?: string) {
    return adminRepository.getSellers({ page, limit, status, search });
  }

  async verifySeller(adminUserId: string, sellerId: string, input: VerifySellerInput, ipAddress?: string) {
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });

    if (!seller) {
      const error: any = new Error('Seller not found.');
      error.statusCode = 404;
      error.code = 'SELLER_NOT_FOUND';
      throw error;
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: { status: input.status as SellerStatus },
    });

    // Notify Seller
    const notifType = input.status === 'VERIFIED' ? NotificationType.SELLER_VERIFIED : NotificationType.SELLER_REJECTED;
    const title = input.status === 'VERIFIED' ? '✅ Seller Verification Approved!' : '❌ Seller Application Rejected';
    const body = input.status === 'VERIFIED'
      ? 'Your store is now verified. You can list products and accept campus orders.'
      : `Reason: ${input.notes || 'Document verification requirements not met.'}`;

    await notificationService.notifyUser({
      userId: seller.userId,
      type: notifType,
      title,
      body,
      actionUrl: '/seller',
    });

    await logAuditEvent('SELLER_VERIFICATION_MODERATED', 'Seller', adminUserId, sellerId, { status: input.status, notes: input.notes }, ipAddress);
    return updatedSeller;
  }

  async getProducts(page: number = 1, limit: number = 20, status?: ProductStatus, search?: string) {
    return adminRepository.getProducts({ page, limit, status, search });
  }

  async updateProductStatus(adminUserId: string, productId: string, input: UpdateProductStatusInput, ipAddress?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId }, include: { seller: true } });

    if (!product) {
      const error: any = new Error('Product not found.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    let mappedStatus: ProductStatus = ProductStatus.ACTIVE;
    if (input.status === 'APPROVED' || input.status === 'ACTIVE') mappedStatus = ProductStatus.ACTIVE;
    else if (input.status === 'HIDDEN' || input.status === 'SUSPENDED') mappedStatus = ProductStatus.SUSPENDED;
    else if (input.status === 'REMOVED') mappedStatus = ProductStatus.ARCHIVED;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { status: mappedStatus },
    });

    // Notify seller
    if (product.seller) {
      await notificationService.notifyUser({
        userId: product.seller.userId,
        type: NotificationType.SYSTEM,
        title: `⚠️ Product Listing Moderated: "${product.title}"`,
        body: `Status updated to ${mappedStatus}. Reason: ${input.reason || 'Policy compliance review.'}`,
        actionUrl: `/seller/products`,
      });
    }

    await logAuditEvent('PRODUCT_MODERATED', 'Product', adminUserId, productId, { status: mappedStatus, reason: input.reason }, ipAddress);
    return updatedProduct;
  }

  async getCategories() {
    return prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async createCategory(adminUserId: string, input: CreateCategoryInput, ipAddress?: string) {
    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        displayOrder: input.displayOrder || 0,
      },
    });

    await logAuditEvent('CATEGORY_CREATED', 'Category', adminUserId, category.id, { name: category.name }, ipAddress);
    return category;
  }

  async updateCategory(adminUserId: string, categoryId: string, input: UpdateCategoryInput, ipAddress?: string) {
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
      },
    });

    await logAuditEvent('CATEGORY_UPDATED', 'Category', adminUserId, categoryId, input, ipAddress);
    return updated;
  }

  async deleteCategory(adminUserId: string, categoryId: string, ipAddress?: string) {
    const count = await prisma.product.count({ where: { categoryId } });
    if (count > 0) {
      const error: any = new Error(`Cannot delete category with ${count} active products.`);
      error.statusCode = 400;
      error.code = 'CATEGORY_HAS_PRODUCTS';
      throw error;
    }

    await prisma.category.delete({ where: { id: categoryId } });
    await logAuditEvent('CATEGORY_DELETED', 'Category', adminUserId, categoryId, {}, ipAddress);
    return { success: true };
  }

  async getOrders(page: number = 1, limit: number = 20, status?: any, search?: string) {
    return adminRepository.getOrders({ page, limit, status, search });
  }

  async createReport(userId: string, input: CreateReportInput, ipAddress?: string) {
    const report = await prisma.report.create({
      data: {
        reporterUserId: userId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        description: input.description || null,
        status: ReportStatus.PENDING,
      },
    });

    await logAuditEvent('REPORT_SUBMITTED', 'Report', userId, report.id, { targetType: input.targetType, targetId: input.targetId }, ipAddress);
    return report;
  }

  async getReports(page: number = 1, limit: number = 20, status?: ReportStatus) {
    return adminRepository.getReports({ page, limit, status });
  }

  async resolveReport(adminUserId: string, reportId: string, input: ResolveReportInput, ipAddress?: string) {
    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: input.status as ReportStatus,
        assignedAdminId: adminUserId,
        resolutionNotes: input.resolutionNotes || null,
        resolvedAt: new Date(),
      },
    });

    await logAuditEvent('REPORT_RESOLVED', 'Report', adminUserId, reportId, { status: input.status }, ipAddress);
    return updated;
  }

  async createDispute(userId: string, input: CreateDisputeInput, ipAddress?: string) {
    const order = await prisma.order.findUnique({ where: { id: input.orderId } });

    if (!order || order.buyerId !== userId) {
      const error: any = new Error('You can only open disputes for your own orders.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const dispute = await prisma.dispute.create({
      data: {
        orderId: input.orderId,
        initiatorUserId: userId,
        reason: input.reason,
        explanation: input.explanation,
        status: DisputeStatus.OPENED,
      },
    });

    await logAuditEvent('DISPUTE_OPENED', 'Dispute', userId, dispute.id, { orderId: input.orderId }, ipAddress);
    return dispute;
  }

  async getDisputes(page: number = 1, limit: number = 20, status?: DisputeStatus) {
    return adminRepository.getDisputes({ page, limit, status });
  }

  async resolveDispute(adminUserId: string, disputeId: string, input: ResolveDisputeInput, ipAddress?: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });

    if (!dispute) {
      const error: any = new Error('Dispute not found.');
      error.statusCode = 404;
      error.code = 'DISPUTE_NOT_FOUND';
      throw error;
    }

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: input.status as DisputeStatus,
        resolutionNotes: input.resolutionNotes || null,
        resolvedAt: new Date(),
      },
    });

    await logAuditEvent('DISPUTE_RESOLVED', 'Dispute', adminUserId, disputeId, { status: input.status }, ipAddress);
    return updated;
  }

  async getAuditLogs(page: number = 1, limit: number = 20) {
    return adminRepository.getAuditLogs({ page, limit });
  }
}

export const adminService = new AdminService();
