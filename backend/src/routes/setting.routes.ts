import { Router } from 'express';
import { SettingController } from '../controllers/setting.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const settingController = new SettingController();

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Create a new setting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, checkPermission('settings:create'), settingController.create);

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkPermission('settings:read'), settingController.findAll);

/**
 * @swagger
 * /api/settings/initialize:
 *   post:
 *     summary: Initialize default settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.post('/initialize', authenticate, checkPermission('settings:create'), settingController.initializeDefaults);

/**
 * @swagger
 * /api/settings/bulk-update:
 *   patch:
 *     summary: Bulk update settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/bulk-update', authenticate, checkPermission('settings:update'), settingController.bulkUpdate);

/**
 * @swagger
 * /api/settings/category/{category}:
 *   get:
 *     summary: Get settings by category
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/category/:category', authenticate, checkPermission('settings:read'), settingController.findByCategory);

/**
 * @swagger
 * /api/settings/key/{key}:
 *   get:
 *     summary: Get setting by key
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/key/:key', authenticate, checkPermission('settings:read'), settingController.findByKey);

/**
 * @swagger
 * /api/settings/value/{key}:
 *   get:
 *     summary: Get parsed setting value by key
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/value/:key', authenticate, checkPermission('settings:read'), settingController.getValue);

/**
 * @swagger
 * /api/settings/key/{key}:
 *   patch:
 *     summary: Update setting by key
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/key/:key', authenticate, checkPermission('settings:update'), settingController.updateByKey);

/**
 * @swagger
 * /api/settings/{id}:
 *   get:
 *     summary: Get setting by ID
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, checkPermission('settings:read'), settingController.findById);

/**
 * @swagger
 * /api/settings/{id}:
 *   put:
 *     summary: Update setting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, checkPermission('settings:update'), settingController.update);

/**
 * @swagger
 * /api/settings/{id}:
 *   delete:
 *     summary: Delete setting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, checkPermission('settings:delete'), settingController.delete);

export default router;
