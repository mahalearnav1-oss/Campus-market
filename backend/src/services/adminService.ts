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
import { UserStatus, SellerStatus, ProductStatus, ReportStatus, DisputeStatus, NotificationType, OrderStatus, EscrowStatus } from '@prisma/client';

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

    // Update associated verification records
    await prisma.sellerVerification.updateMany({
      where: { sellerId },
      data: {
        status: input.status as SellerStatus,
        verifiedAt: input.status === 'VERIFIED' ? new Date() : null,
        rejectionReason: input.status === 'REJECTED' ? input.notes || 'Requirements not met' : null,
      },
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
      actionUrl: '/seller/products',
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
      const error: any = new Error(`Cannot delete this category while it has ${count} active product(s).`);
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
      const error: any = new Error('We couldn\'t find this campus.');
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
      const error: any = new Error('We couldn\'t find this campus.');
      error.statusCode = 404;
      error.code = 'CAMPUS_NOT_FOUND';
      throw error;
    }

    // Protect against deleting campus if active users or products reference it
    const usage = await collegeRepository.countUsage(campusId);
    if (usage.userCount > 0 || usage.productCount > 0) {
      const error: any = new Error(
        `Cannot delete "${existing.name}" because ${usage.userCount} user(s) and ${usage.productCount} product(s) are linked to it. Please reassign records first.`
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
    // Validate target existence
    if (input.targetType === 'PRODUCT') {
      const product = await prisma.product.findUnique({ where: { id: input.targetId } });
      if (!product) {
        const error: any = new Error('Reported product does not exist.');
        error.statusCode = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
      }
    } else if (input.targetType === 'SELLER') {
      const seller = await prisma.seller.findUnique({ where: { id: input.targetId } });
      if (!seller) {
        const error: any = new Error('Reported seller does not exist.');
        error.statusCode = 404;
        error.code = 'SELLER_NOT_FOUND';
        throw error;
      }
    } else if (input.targetType === 'USER') {
      const user = await prisma.user.findUnique({ where: { id: input.targetId } });
      if (!user) {
        const error: any = new Error('Reported user does not exist.');
        error.statusCode = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
      }
    }

    // Duplicate report prevention (check if user already has an active pending report for this target)
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterUserId,
        targetType: input.targetType,
        targetId: input.targetId,
        status: { in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW] },
      },
    });

    if (existingReport) {
      return existingReport;
    }

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
    const data = await adminRepository.getReports({ page, limit, status });

    // Enrich reports with target titles / details
    const enrichedReports = await Promise.all(
      data.reports.map(async (r: any) => {
        let targetDetails: any = null;
        try {
          if (r.targetType === 'PRODUCT') {
            const p = await prisma.product.findUnique({
              where: { id: r.targetId },
              select: { id: true, title: true, price: true, status: true },
            });
            targetDetails = p ? { title: p.title, price: p.price, status: p.status } : null;
          } else if (r.targetType === 'SELLER') {
            const s = await prisma.seller.findUnique({
              where: { id: r.targetId },
              select: { id: true, storeName: true, status: true },
            });
            targetDetails = s ? { storeName: s.storeName, status: s.status } : null;
          } else if (r.targetType === 'USER') {
            const u = await prisma.user.findUnique({
              where: { id: r.targetId },
              select: { id: true, firstName: true, lastName: true, email: true },
            });
            targetDetails = u ? { name: `${u.firstName} ${u.lastName}`, email: u.email } : null;
          }
        } catch {
          // Ignore
        }
        return { ...r, targetDetails };
      })
    );

    return { reports: enrichedReports, pagination: data.pagination };
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
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        seller: { select: { id: true, userId: true, storeName: true } },
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!order) {
      const error: any = new Error('Order not found.');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    // Security Check: Only buyer or seller involved in the order can open a dispute
    if (order.buyerId !== userId && order.seller.userId !== userId) {
      const error: any = new Error('You are not authorized to create a dispute for this order.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_DISPUTE';
      throw error;
    }

    // Lifecycle Check: Order cannot be in PAYMENT_PENDING or CANCELLED
    if (order.status === OrderStatus.PAYMENT_PENDING || order.status === OrderStatus.CANCELLED) {
      const error: any = new Error(`Cannot dispute an order with status ${order.status}.`);
      error.statusCode = 400;
      error.code = 'ORDER_INELIGIBLE_FOR_DISPUTE';
      throw error;
    }

    // Duplicate Prevention Check
    const existingDispute = await prisma.dispute.findUnique({ where: { orderId: input.orderId } });
    if (existingDispute && (existingDispute.status === DisputeStatus.OPENED || existingDispute.status === DisputeStatus.UNDER_REVIEW)) {
      const error: any = new Error('An active dispute is already pending for this order.');
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
        proofImageUrls: input.proofImageUrls && input.proofImageUrls.length > 0 ? (input.proofImageUrls as any) : undefined,
        status: DisputeStatus.OPENED,
      },
    });

    // Update order status to DISPUTED and record history
    await prisma.order.update({
      where: { id: input.orderId },
      data: { status: OrderStatus.DISPUTED },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: input.orderId,
        previousStatus: order.status,
        newStatus: OrderStatus.DISPUTED,
        changedByUserId: userId,
        reason: `Dispute opened (${input.reason}): ${input.explanation.slice(0, 200)}`,
      },
    });

    // In-app Notification to counterparty
    const counterpartyUserId = order.buyerId === userId ? order.seller.userId : order.buyerId;
    try {
      await prisma.notification.create({
        data: {
          userId: counterpartyUserId,
          type: NotificationType.SYSTEM,
          title: `⚠️ Order #${order.orderNumber} Disputed`,
          body: `A dispute has been submitted for Order #${order.orderNumber} regarding "${input.reason.replace(/_/g, ' ')}". Campus escrow is temporarily frozen while administrators review.`,
          actionUrl: `/orders/${order.orderNumber}`,
          data: { orderId: order.id, disputeId: dispute.id },
        },
      });
    } catch {
      // Non-blocking notification
    }

    await logAuditEvent('DISPUTE_OPENED', 'Dispute', userId, dispute.id, { orderId: input.orderId }, ipAddress);
    return dispute;
  }

  async getDisputes(page: number = 1, limit: number = 20, status?: DisputeStatus) {
    return adminRepository.getDisputes({ page, limit, status });
  }

  async resolveDispute(adminUserId: string, disputeId: string, input: ResolveDisputeInput, ipAddress?: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            buyer: true,
            seller: { select: { id: true, userId: true, storeName: true } },
            escrowLedger: true,
          },
        },
      },
    });

    if (!dispute) {
      const error: any = new Error('Dispute not found.');
      error.statusCode = 404;
      error.code = 'DISPUTE_NOT_FOUND';
      throw error;
    }

    let targetDisputeStatus: DisputeStatus;
    let targetOrderStatus: OrderStatus | null = null;
    let targetEscrowStatus: EscrowStatus | null = null;

    if (input.status === 'RESOLVED_BUYER_REFUND' || input.status === 'RESOLVED') {
      targetDisputeStatus = DisputeStatus.RESOLVED_BUYER_REFUND;
      targetOrderStatus = OrderStatus.REFUNDED;
      targetEscrowStatus = EscrowStatus.REFUNDED;
    } else if (input.status === 'RESOLVED_SELLER_PAYOUT') {
      targetDisputeStatus = DisputeStatus.RESOLVED_SELLER_PAYOUT;
      targetOrderStatus = OrderStatus.COMPLETED;
      targetEscrowStatus = EscrowStatus.RELEASED;
    } else if (input.status === 'UNDER_REVIEW') {
      targetDisputeStatus = DisputeStatus.UNDER_REVIEW;
    } else {
      targetDisputeStatus = DisputeStatus.REJECTED;
      targetOrderStatus = OrderStatus.COMPLETED;
    }

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: targetDisputeStatus,
        resolutionNotes: input.resolutionNotes || null,
        resolvedAt: targetDisputeStatus !== DisputeStatus.UNDER_REVIEW ? new Date() : null,
      },
    });

    // Update order status if resolving
    if (targetOrderStatus) {
      await prisma.order.update({
        where: { id: dispute.orderId },
        data: {
          status: targetOrderStatus,
          completedAt: targetOrderStatus === OrderStatus.COMPLETED ? new Date() : undefined,
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: dispute.orderId,
          previousStatus: OrderStatus.DISPUTED,
          newStatus: targetOrderStatus,
          changedByUserId: adminUserId,
          reason: `Dispute resolved by admin: ${targetDisputeStatus}. Notes: ${input.resolutionNotes || 'None'}`,
        },
      });
    }

    // Update escrow ledger if applicable
    if (targetEscrowStatus && dispute.order.escrowLedger) {
      await prisma.escrowLedger.update({
        where: { orderId: dispute.orderId },
        data: {
          status: targetEscrowStatus,
          releasedAt: targetEscrowStatus === EscrowStatus.RELEASED ? new Date() : undefined,
        },
      });
    }

    // Notify Buyer and Seller of resolution
    try {
      const resolutionTitle =
        targetDisputeStatus === DisputeStatus.RESOLVED_BUYER_REFUND
          ? `✓ Dispute Resolved: Refund Approved (#${dispute.order.orderNumber})`
          : targetDisputeStatus === DisputeStatus.RESOLVED_SELLER_PAYOUT
          ? `✓ Dispute Resolved: Payout Released (#${dispute.order.orderNumber})`
          : `Dispute Decision for Order #${dispute.order.orderNumber}`;

      const resolutionBody =
        targetDisputeStatus === DisputeStatus.RESOLVED_BUYER_REFUND
          ? `The escrow dispute for Order #${dispute.order.orderNumber} was resolved with a full refund to the buyer. ${input.resolutionNotes ? `Notes: ${input.resolutionNotes}` : ''}`
          : targetDisputeStatus === DisputeStatus.RESOLVED_SELLER_PAYOUT
          ? `The escrow dispute for Order #${dispute.order.orderNumber} was resolved with funds released to the seller. ${input.resolutionNotes ? `Notes: ${input.resolutionNotes}` : ''}`
          : `The dispute for Order #${dispute.order.orderNumber} was rejected by administration. ${input.resolutionNotes ? `Notes: ${input.resolutionNotes}` : ''}`;

      await Promise.all([
        prisma.notification.create({
          data: {
            userId: dispute.order.buyerId,
            type: NotificationType.SYSTEM,
            title: resolutionTitle,
            body: resolutionBody,
            actionUrl: `/orders/${dispute.order.orderNumber}`,
          },
        }),
        prisma.notification.create({
          data: {
            userId: dispute.order.seller.userId,
            type: NotificationType.SYSTEM,
            title: resolutionTitle,
            body: resolutionBody,
            actionUrl: `/orders/${dispute.order.orderNumber}`,
          },
        }),
      ]);
    } catch {
      // Non-blocking
    }

    await logAuditEvent('DISPUTE_RESOLVED', 'Dispute', adminUserId, disputeId, { status: targetDisputeStatus }, ipAddress);
    return updated;
  }

  async getAuditLogs(page: number = 1, limit: number = 20) {
    return adminRepository.getAuditLogs({ page, limit });
  }
}

export const adminService = new AdminService();
