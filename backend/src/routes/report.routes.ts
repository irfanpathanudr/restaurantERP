import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const reportController = new ReportController();

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Get sales report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/sales', authenticate, checkPermission('reports:read'), reportController.getSalesReport);

/**
 * @swagger
 * /api/reports/payments:
 *   get:
 *     summary: Get payment report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/payments', authenticate, checkPermission('reports:read'), reportController.getPaymentReport);

/**
 * @swagger
 * /api/reports/expenses:
 *   get:
 *     summary: Get expense report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/expenses', authenticate, checkPermission('reports:read'), reportController.getExpenseReport);

/**
 * @swagger
 * /api/reports/profit-loss:
 *   get:
 *     summary: Get profit/loss report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profit-loss', authenticate, checkPermission('reports:read'), reportController.getProfitLossReport);

/**
 * @swagger
 * /api/reports/top-selling-items:
 *   get:
 *     summary: Get top selling items report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/top-selling-items', authenticate, checkPermission('reports:read'), reportController.getTopSellingItems);

/**
 * @swagger
 * /api/reports/employee-performance:
 *   get:
 *     summary: Get employee performance report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/employee-performance', authenticate, checkPermission('reports:read'), reportController.getEmployeePerformanceReport);

/**
 * @swagger
 * /api/reports/vendor-performance:
 *   get:
 *     summary: Get vendor performance report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/vendor-performance', authenticate, checkPermission('reports:read'), reportController.getVendorPerformanceReport);

/**
 * @swagger
 * /api/reports/daily-sales-summary:
 *   get:
 *     summary: Get daily sales summary
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/daily-sales-summary', authenticate, checkPermission('reports:read'), reportController.getDailySalesSummary);

export default router;
