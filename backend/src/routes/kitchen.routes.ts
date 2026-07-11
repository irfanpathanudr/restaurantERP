import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const kitchenController = new KitchenController();

/**
 * @swagger
 * /api/kitchens:
 *   post:
 *     summary: Create a new kitchen
 *     tags: [Kitchens]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, checkPermission('kitchens:create'), kitchenController.create);

/**
 * @swagger
 * /api/kitchens:
 *   get:
 *     summary: Get all kitchens
 *     tags: [Kitchens]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkPermission('kitchens:read'), kitchenController.findAll);

/**
 * @swagger
 * /api/kitchens/{id}:
 *   get:
 *     summary: Get kitchen by ID
 *     tags: [Kitchens]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, checkPermission('kitchens:read'), kitchenController.findById);

/**
 * @swagger
 * /api/kitchens/branch/{branchId}/code/{code}:
 *   get:
 *     summary: Get kitchen by branch and code
 *     tags: [Kitchens]
 *     security:
 *       - bearerAuth: []
 */
router.get('/branch/:branchId/code/:code', authenticate, checkPermission('kitchens:read'), kitchenController.findByCode);

/**
 * @swagger
 * /api/kitchens/{id}:
 *   put:
 *     summary: Update kitchen
 *     tags: [Kitchens]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, checkPermission('kitchens:update'), kitchenController.update);

/**
 * @swagger
 * /api/kitchens/{id}:
 *   delete:
 *     summary: Delete kitchen
 *     tags: [Kitchens]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, checkPermission('kitchens:delete'), kitchenController.delete);

/**
 * @swagger
 * /api/kitchens/{id}/sort-order:
 *   patch:
 *     summary: Update kitchen sort order
 *     tags: [Kitchens]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/sort-order', authenticate, checkPermission('kitchens:update'), kitchenController.updateSortOrder);

export default router;
