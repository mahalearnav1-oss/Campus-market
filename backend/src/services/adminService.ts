import { adminRepository } from '../repositories/adminRepository';
import { collegeRepository } from '../repositories/collegeRepository';
import { prisma } from '../config/prisma';
import { logAuditEvent } from '../utils/auditLogger';
import { notificationService } from './notificationService';
import { cacheService } from './cacheService';
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
  CreateCampusInput,
  UpdateCampusInput,
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
    const seller = await prisma.seller.update({
      where: { id: sellerId },
      data: { status: input.status as SellerStatus },
      include: { user: true },
    });

    await logAuditEvent('SELLER_VERIFICATION_UPDATED', 'Seller', adminUserId, sellerId, { status: input.status, notes: input.notes }, ipAddress);

    // Notify seller
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

    return seller;
  }

  async getProducts(page: number = 1, limit: number = 20, status?: ProductStatus, search?: string) {
    return adminRepository.getProducts({ page, limit, status, search });
  }

  async updateProductStatus(adminUserId: string, productId: string, input: UpdateProductStatusInput, ipAddress?: string) {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { status: input.status as ProductStatus },
      include: { seller: true },
    });

    await logAuditEvent('PRODUCT_STATUS_UPDATED', 'Product', adminUserId, productId, { status: input.status, reason: input.reason }, ipAddress);
    return product;
  }

  async getCategories() {
    return prisma.category.findMany({
      include: {
        _count: { select: { products: true, subcategories: true } },
      },
      orderBy: { displayOrder: 'asc' },
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

  // --- CAMPUS / COLLEGE ADMINISTRATION ---

  async getCampuses() {
    return collegeRepository.findAllWithStats();
  }

  async createCampus(adminUserId: string, input: CreateCampusInput, ipAddress?: string) {
    // 1. Check duplicate code
    const existingCode = await collegeRepository.findByCode(input.code);
    if (existingCode) {
      const error: any = new Error(`A campus with code "${input.code}" already exists.`);
      error.statusCode = 409;
      error.code = 'DUPLICATE_CAMPUS_CODE';
      throw error;
    }

    // 2. Generate or check domain
    const domain = input.domain || `${input.code.toLowerCase()}.edu`;
    const existingDomain = await collegeRepository.findByDomain(domain);
    if (existingDomain) {
      const error: any = new Error(`A campus with domain "${domain}" already exists.`);
      error.statusCode = 409;
      error.code = 'DUPLICATE_CAMPUS_DOMAIN';
      throw error;
    }

    // 3. Create campus
    const campus = await collegeRepository.create({
      name: input.name,
      code: input.code,
      domain,
      city: input.city,
      state: input.state,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
    });

    // 4. Invalidate caches
    cacheService.delete('colleges:all');

    // 5. Log audit event
    await logAuditEvent('CAMPUS_CREATED', 'College', adminUserId, campus.id, { name: campus.name, code: campus.code }, ipAddress);
    return campus;
  }

  async updateCampus(adminUserId: string, campusId: string, input: UpdateCampusInput, ipAddress?: string) {
    const existing = await collegeRepository.findById(campusId);
    if (!existing) {
      const error: any = new Error('Campus not found.');
      error.statusCode = 404;
      error.code = 'CAMPUS_NOT_FOUND';
      throw error;
    }

    // If code is being updated, check uniqueness
    if (input.code && input.code !== existing.code) {
      const duplicateCode = await collegeRepository.findByCode(input.code);
      if (duplicateCode && duplicateCode.id !== campusId) {
        const error: any = new Error(`A campus with code "${input.code}" already exists.`);
        error.statusCode = 409;
        error.code = 'DUPLICATE_CAMPUS_CODE';
        throw error;
      }
    }

    // If domain is being updated, check uniqueness
    if (input.domain && input.domain !== existing.domain) {
      const duplicateDomain = await collegeRepository.findByDomain(input.domain);
      if (duplicateDomain && duplicateDomain.id !== campusId) {
        const error: any = new Error(`A campus with domain "${input.domain}" already exists.`);
        error.statusCode = 409;
        error.code = 'DUPLICATE_CAMPUS_DOMAIN';
        throw error;
      }
    }

    const updated = await collegeRepository.update(campusId, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.code ? { code: input.code } : {}),
      ...(input.domain ? { domain: input.domain } : {}),
      ...(input.city ? { city: input.city } : {}),
      ...(input.state ? { state: input.state } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
    });

    cacheService.delete('colleges:all');
    cacheService.delete(`college:id:${campusId}`);

    await logAuditEvent('CAMPUS_UPDATED', 'College', adminUserId, campusId, input, ipAddress);
    return updated;
  }

  async deleteCampus(adminUserId: string, campusId: string, ipAddress?: string) {
    const existing = await collegeRepository.findById(campusId);
    if (!existing) {
      const error: any = new Error('Campus not found.');
      error.statusCode = 404;
      error.code = 'CAMPUS_NOT_FOUND';
      throw error;
    }

    // Protect against deleting campus if active users or products reference it
    const usage = await collegeRepository.countUsage(campusId);
    if (usage.userCount > 0 || usage.productCount > 0) {
      const error: any = new Error(
        `Cannot delete campus "${existing.name}" because ${usage.userCount} user(s) and ${usage.productCount} product(s) are linked to it. Please reassign records first.`
      );
      error.statusCode = 400;
      error.code = 'CAMPUS_IN_USE';
      throw error;
    }

    await collegeRepository.delete(campusId);
    cacheService.delete('colleges:all');
    cacheService.delete(`college:id:${campusId}`);

    await logAuditEvent('CAMPUS_DELETED', 'College', adminUserId, campusId, { code: existing.code }, ipAddress);
    return { success: true, message: `Campus "${existing.name}" deleted successfully.` };
  }

  async getOrders(page: number = 1, limit: number = 20, status?: any, search?: string) {
    return adminRepository.getOrders({ page, limit, status, search });
  }

  async createReport(reporterUserId: string, input: CreateReportInput, ipAddress?: string) {
    const report = await prisma.report.create({
      data: {
        reporterUserId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        description: input.description || null,
        status: ReportStatus.PENDING,
      },
    });

    await logAuditEvent('REPORT_CREATED', 'Report', reporterUserId, report.id, { targetType: input.targetType }, ipAddress);
    return report;
  }

  async getReports(page: number = 1, limit: number = 20, status?: ReportStatus) {
    return adminRepository.getReports({ page, limit, status });
  }

  async resolveReport(adminUserId: string, reportId: string, input: ResolveReportInput, ipAddress?: string) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      const error: any = new Error('Report not found.');
      error.statusCode = 404;
      error.code = 'REPORT_NOT_FOUND';
      throw error;
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: input.status as ReportStatus,
        resolutionNotes: input.resolutionNotes || null,
        resolvedAt: new Date(),
        assignedAdminId: adminUserId,
      },
    });

    await logAuditEvent('REPORT_RESOLVED', 'Report', adminUserId, reportId, { status: input.status }, ipAddress);
    return updated;
  }

  async createDispute(userId: string, input: CreateDisputeInput, ipAddress?: string) {
    const order = await prisma.order.findUnique({ where: { id: input.orderId } });
    if (!order) {
      const error: any = new Error('Order not found.');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    const existingDispute = await prisma.dispute.findUnique({ where: { orderId: input.orderId } });
    if (existingDispute) {
      const error: any = new Error('A dispute is already active for this order.');
      error.statusCode = 409;
      error.code = 'DUPLICATE_DISPUTE';
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
