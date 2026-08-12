import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import {
  updateUserStatusSchema,
  verifySellerSchema,
  updateProductStatusSchema,
  createCategorySchema,
  updateCategorySchema,
  createReportSchema,
  resolveReportSchema,
  createDisputeSchema,
  resolveDisputeSchema,
} from '../validators/adminValidators';

export async function getDashboardAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getDashboardAnalytics();
    res.status(200).json({
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const search = req.query.search as string;
    const status = req.query.status as any;
    const role = req.query.role as string;

    const result = await adminService.getUsers(page, limit, search, status, role);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = req.user!.id;
    const userId = req.params.id;
    const validatedInput = updateUserStatusSchema.parse(req.body);

    const user = await adminService.updateUserStatus(adminUserId, userId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { user },
      message: 'User status updated successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as any;
    const search = req.query.search as string;

    const result = await adminService.getSellers(page, limit, status, search);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifySeller(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = req.user!.id;
    const sellerId = req.params.id;
    const validatedInput = verifySellerSchema.parse(req.body);

    const seller = await adminService.verifySeller(adminUserId, sellerId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { seller },
      message: `Seller verification status updated to ${validatedInput.status}.`,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as any;
    const search = req.query.search as string;

    const result = await adminService.getProducts(page, limit, status, search);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = req.user!.id;
    const productId = req.params.id;
    const validatedInput = updateProductStatusSchema.parse(req.body);

    const product = await adminService.updateProductStatus(adminUserId, productId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { product },
      message: 'Product status updated successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await adminService.getCategories();
    res.status(200).json({
      success: true,
      data: { categories },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = req.user!.id;
    const validatedInput = createCategorySchema.parse(req.body);

    const category = await adminService.createCategory(adminUserId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { category },
      message: 'Category created successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = req.user!.id;
    const categoryId = req.params.id;
    const validatedInput = updateCategorySchema.parse(req.body);

    const category = await adminService.updateCategory(adminUserId, categoryId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { category },
      message: 'Category updated.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = req.user!.id;
    const categoryId = req.params.id;

    const result = await adminService.deleteCategory(adminUserId, categoryId, req.ip);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as any;
    const search = req.query.search as string;

    const result = await adminService.getOrders(page, limit, status, search);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function createReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = createReportSchema.parse(req.body);

    const report = await adminService.createReport(userId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { report },
      message: 'Report submitted for review.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getReports(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as any;

    const result = await adminService.getReports(page, limit, status);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveReport(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = req.user!.id;
    const reportId = req.params.id;
    const validatedInput = resolveReportSchema.parse(req.body);

    const report = await adminService.resolveReport(adminUserId, reportId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { report },
      message: `Report status updated to ${validatedInput.status}.`,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function createDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = createDisputeSchema.parse(req.body);

    const dispute = await adminService.createDispute(userId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { dispute },
      message: 'Dispute submitted for admin mediation.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDisputes(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as any;

    const result = await adminService.getDisputes(page, limit, status);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = req.user!.id;
    const disputeId = req.params.id;
    const validatedInput = resolveDisputeSchema.parse(req.body);

    const dispute = await adminService.resolveDispute(adminUserId, disputeId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { dispute },
      message: `Dispute status updated to ${validatedInput.status}.`,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    const result = await adminService.getAuditLogs(page, limit);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
