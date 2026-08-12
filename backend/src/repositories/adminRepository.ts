import { prisma } from '../config/prisma';
import { UserStatus, SellerStatus, ProductStatus, OrderStatus, ReportStatus, DisputeStatus, Prisma } from '@prisma/client';

export class AdminRepository {
  async getDashboardMetrics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalSellers,
      activeSellers,
      pendingSellers,
      totalProducts,
      activeProducts,
      totalOrders,
      ordersToday,
      revenueResult,
      openReports,
      openDisputes,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.seller.count(),
      prisma.seller.count({ where: { status: SellerStatus.VERIFIED } }),
      prisma.seller.count({ where: { status: SellerStatus.PENDING } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.payment.aggregate({
        where: { status: { in: ['AUTHORIZED', 'CAPTURED_ESCROW', 'RELEASED_TO_SELLER'] } },
        _sum: { amount: true },
      }),
      prisma.report.count({ where: { status: { in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW] } } }),
      prisma.dispute.count({ where: { status: { in: [DisputeStatus.OPENED, DisputeStatus.UNDER_REVIEW] } } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { firstName: true, email: true } } },
      }),
    ]);

    return {
      totalUsers,
      totalSellers,
      activeSellers,
      pendingSellers,
      totalProducts,
      activeProducts,
      totalOrders,
      ordersToday,
      totalRevenue: Number(revenueResult._sum.amount || 0).toFixed(2),
      openReports,
      openDisputes,
      recentAuditLogs,
    };
  }

  async getUsers(options: { page: number; limit: number; search?: string; status?: UserStatus; role?: string }) {
    const { page, limit, search, status, role } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(status ? { status } : {}),
      ...(role ? { role: role as any } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          status: true,
          isStudentVerified: true,
          createdAt: true,
          college: { select: { name: true } },
          seller: { select: { id: true, storeName: true, status: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { users, pagination: { page, limit, total, totalPages } };
  }

  async getSellers(options: { page: number; limit: number; status?: SellerStatus; search?: string }) {
    const { page, limit, status, search } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.SellerWhereInput = {
      ...(status ? { status } : {}),
      ...(search ? { storeName: { contains: search } } : {}),
    };

    const [total, sellers] = await Promise.all([
      prisma.seller.count({ where }),
      prisma.seller.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { sellers, pagination: { page, limit, total, totalPages } };
  }

  async getProducts(options: { page: number; limit: number; status?: ProductStatus; search?: string }) {
    const { page, limit, status, search } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search } } : {}),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { storeName: true } },
          category: { select: { name: true } },
          images: { take: 1 },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { products, pagination: { page, limit, total, totalPages } };
  }

  async getOrders(options: { page: number; limit: number; status?: OrderStatus; search?: string }) {
    const { page, limit, status, search } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(status ? { status } : {}),
      ...(search ? { orderNumber: { contains: search } } : {}),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { firstName: true, email: true } },
          seller: { select: { storeName: true } },
          payment: true,
          items: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { orders, pagination: { page, limit, total, totalPages } };
  }

  async getReports(options: { page: number; limit: number; status?: ReportStatus }) {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {
      ...(status ? { status } : {}),
    };

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, firstName: true, email: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { reports, pagination: { page, limit, total, totalPages } };
  }

  async getDisputes(options: { page: number; limit: number; status?: DisputeStatus }) {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.DisputeWhereInput = {
      ...(status ? { status } : {}),
    };

    const [total, disputes] = await Promise.all([
      prisma.dispute.count({ where }),
      prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { include: { buyer: true, seller: true } },
          initiator: { select: { firstName: true, email: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { disputes, pagination: { page, limit, total, totalPages } };
  }

  async getAuditLogs(options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { firstName: true, email: true, role: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { logs, pagination: { page, limit, total, totalPages } };
  }
}

export const adminRepository = new AdminRepository();
