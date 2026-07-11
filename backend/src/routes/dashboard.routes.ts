import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/overview', authenticate, checkPermission('dashboard:read'), dashboardController.getOverview);

/**
 * @swagger
 * /api/dashboard/recent-orders:
 *   get:
 *     summary: Get recent orders
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/recent-orders', authenticate, checkPermission('dashboard:read'), dashboardController.getRecentOrders);

/**
 * @swagger
 * /api/dashboard/revenue-analytics:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/revenue-analytics', authenticate, checkPermission('dashboard:read'), dashboardController.getRevenueAnalytics);

/**
 * @swagger
 * /api/dashboard/order-status-distribution:
 *   get:
 *     summary: Get order status distribution
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/order-status-distribution', authenticate, checkPermission('dashboard:read'), dashboardController.getOrderStatusDistribution);

/**
 * @swagger
 * /api/dashboard/payment-method-distribution:
 *   get:
 *     summary: Get payment method distribution
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/payment-method-distribution', authenticate, checkPermission('dashboard:read'), dashboardController.getPaymentMethodDistribution);

/**
 * @swagger
 * /api/dashboard/low-stock-alerts:
 *   get:
 *     summary: Get low stock alerts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/low-stock-alerts', authenticate, checkPermission('dashboard:read'), dashboardController.getLowStockAlerts);

/**
 * @swagger
 * /api/dashboard/upcoming-reservations:
 *   get:
 *     summary: Get upcoming reservations
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/upcoming-reservations', authenticate, checkPermission('dashboard:read'), dashboardController.getUpcomingReservations);

/**
 * @swagger
 * /api/dashboard/top-customers:
 *   get:
 *     summary: Get top customers
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/top-customers', authenticate, checkPermission('dashboard:read'), dashboardController.getTopCustomers);

export default router;
