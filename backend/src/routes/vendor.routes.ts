import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const vendorController = new VendorController();

/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Create a new vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, checkPermission('vendors:create'), vendorController.create);

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkPermission('vendors:read'), vendorController.findAll);

/**
 * @swagger
 * /api/vendors/top:
 *   get:
 *     summary: Get top vendors by purchase amount
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/top', authenticate, checkPermission('vendors:read'), vendorController.getTopVendors);

/**
 * @swagger
 * /api/vendors/outstanding:
 *   get:
 *     summary: Get vendors with outstanding balance
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/outstanding', authenticate, checkPermission('vendors:read'), vendorController.getWithOutstanding);

/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get vendor by ID
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, checkPermission('vendors:read'), vendorController.findById);

/**
 * @swagger
 * /api/vendors/code/{code}:
 *   get:
 *     summary: Get vendor by code
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/code/:code', authenticate, checkPermission('vendors:read'), vendorController.findByCode);

/**
 * @swagger
 * /api/vendors/{id}:
 *   put:
 *     summary: Update vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, checkPermission('vendors:update'), vendorController.update);

/**
 * @swagger
 * /api/vendors/{id}:
 *   delete:
 *     summary: Delete vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, checkPermission('vendors:delete'), vendorController.delete);

/**
 * @swagger
 * /api/vendors/{id}/rating:
 *   patch:
 *     summary: Update vendor rating
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/rating', authenticate, checkPermission('vendors:update'), vendorController.updateRating);

/**
 * @swagger
 * /api/vendors/{id}/statement:
 *   get:
 *     summary: Get vendor statement
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/statement', authenticate, checkPermission('vendors:read'), vendorController.getStatement);

export default router;
