import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const auditLogController = new AuditLogController();

/**
 * @swagger
 * /api/audit-logs:
 *   post:
 *     summary: Create a new audit log entry
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, checkPermission('audit_logs:create'), auditLogController.create);

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get all audit logs with filters
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkPermission('audit_logs:read'), auditLogController.findAll);

/**
 * @swagger
 * /api/audit-logs/action-summary:
 *   get:
 *     summary: Get audit action summary
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/action-summary', authenticate, checkPermission('audit_logs:read'), auditLogController.getActionSummary);

/**
 * @swagger
 * /api/audit-logs/user-activity:
 *   get:
 *     summary: Get user activity summary
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/user-activity', authenticate, checkPermission('audit_logs:read'), auditLogController.getUserActivitySummary);

/**
 * @swagger
 * /api/audit-logs/{id}:
 *   get:
 *     summary: Get audit log by ID
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, checkPermission('audit_logs:read'), auditLogController.findById);

/**
 * @swagger
 * /api/audit-logs/entity/{entityType}/{entityId}:
 *   get:
 *     summary: Get audit logs for specific entity
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/entity/:entityType/:entityId', authenticate, checkPermission('audit_logs:read'), auditLogController.findByEntity);

/**
 * @swagger
 * /api/audit-logs/user/{userId}:
 *   get:
 *     summary: Get audit logs for specific user
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/user/:userId', authenticate, checkPermission('audit_logs:read'), auditLogController.findByUser);

export default router;
