import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreatePermissionDto } from '../dto/permission/CreatePermissionDto';
import { UpdatePermissionDto } from '../dto/permission/UpdatePermissionDto';

const router = Router();
const permissionController = new PermissionController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 */
router.get('/', checkPermission('permissions.read'), permissionController.findAll);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 */
router.get('/:id', checkPermission('permissions.read'), permissionController.findById);

/**
 * @swagger
 * /api/v1/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Permission created successfully
 */
router.post('/', checkPermission('permissions.create'), validateDTO(CreatePermissionDto), permissionController.create);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   put:
 *     summary: Update permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission updated successfully
 */
router.put('/:id', checkPermission('permissions.update'), validateDTO(UpdatePermissionDto), permissionController.update);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   delete:
 *     summary: Delete permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 */
router.delete('/:id', checkPermission('permissions.delete'), permissionController.delete);

export default router;
