import { Router } from 'express';
import {
  getDashboardAnalytics,
  getUsers,
  updateUserStatus,
  getSellers,
  verifySeller,
  getProducts,
  updateProductStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCampuses,
  createCampus,
  updateCampus,
  deleteCampus,
  getOrders,
  createReport,
  getReports,
  resolveReport,
  createDispute,
  getDisputes,
  resolveDispute,
  getAuditLogs,
} from '../controllers/adminController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireModerator, requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Public / Authenticated Report & Dispute Submission
router.post('/reports', requireAuth, createReport);
router.post('/disputes', requireAuth, createDispute);
router.post('/orders/:orderId/dispute', requireAuth, (req, res, next) => {
  req.body.orderId = req.params.orderId;
  return createDispute(req, res, next);
});

// Admin Routes (Guarded by requireAdmin / requireModerator)
router.get('/admin/dashboard', requireAuth, requireModerator, getDashboardAnalytics);
router.get('/admin/users', requireAuth, requireModerator, getUsers);
router.patch('/admin/users/:id/status', requireAuth, requireAdmin, updateUserStatus);

router.get('/admin/sellers', requireAuth, requireModerator, getSellers);
router.post('/admin/sellers/:id/verify', requireAuth, requireAdmin, verifySeller);

router.get('/admin/products', requireAuth, requireModerator, getProducts);
router.patch('/admin/products/:id/status', requireAuth, requireModerator, updateProductStatus);

router.get('/admin/categories', requireAuth, requireModerator, getCategories);
router.post('/admin/categories', requireAuth, requireAdmin, createCategory);
router.patch('/admin/categories/:id', requireAuth, requireAdmin, updateCategory);
router.delete('/admin/categories/:id', requireAuth, requireAdmin, deleteCategory);

router.get('/admin/campuses', requireAuth, requireModerator, getCampuses);
router.post('/admin/campuses', requireAuth, requireAdmin, createCampus);
router.patch('/admin/campuses/:id', requireAuth, requireAdmin, updateCampus);
router.delete('/admin/campuses/:id', requireAuth, requireAdmin, deleteCampus);

router.get('/admin/orders', requireAuth, requireModerator, getOrders);
router.get('/admin/reports', requireAuth, requireModerator, getReports);
router.patch('/admin/reports/:id/resolve', requireAuth, requireModerator, resolveReport);

router.get('/admin/disputes', requireAuth, requireModerator, getDisputes);
router.patch('/admin/disputes/:id/resolve', requireAuth, requireAdmin, resolveDispute);

router.get('/admin/audit-logs', requireAuth, requireAdmin, getAuditLogs);

export default router;

