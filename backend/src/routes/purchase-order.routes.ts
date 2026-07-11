import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/purchase-order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const purchaseOrderController = new PurchaseOrderController();

/**
 * @swagger
 * /api/purchase-orders:
 *   post:
 *     summary: Create a new purchase order
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, checkPermission('purchase_orders:create'), purchaseOrderController.create);

/**
 * @swagger
 * /api/purchase-orders:
 *   get:
 *     summary: Get all purchase orders
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkPermission('purchase_orders:read'), purchaseOrderController.findAll);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, checkPermission('purchase_orders:read'), purchaseOrderController.findById);

/**
 * @swagger
 * /api/purchase-orders/po-number/{poNumber}:
 *   get:
 *     summary: Get purchase order by PO number
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/po-number/:poNumber', authenticate, checkPermission('purchase_orders:read'), purchaseOrderController.findByPONumber);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   put:
 *     summary: Update purchase order
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, checkPermission('purchase_orders:update'), purchaseOrderController.update);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   delete:
 *     summary: Delete purchase order
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, checkPermission('purchase_orders:delete'), purchaseOrderController.delete);

/**
 * @swagger
 * /api/purchase-orders/{id}/submit:
 *   patch:
 *     summary: Submit purchase order for approval
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/submit', authenticate, checkPermission('purchase_orders:update'), purchaseOrderController.submitForApproval);

/**
 * @swagger
 * /api/purchase-orders/{id}/approve:
 *   patch:
 *     summary: Approve purchase order
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/approve', authenticate, checkPermission('purchase_orders:approve'), purchaseOrderController.approve);

/**
 * @swagger
 * /api/purchase-orders/{id}/reject:
 *   patch:
 *     summary: Reject purchase order
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/reject', authenticate, checkPermission('purchase_orders:approve'), purchaseOrderController.reject);

/**
 * @swagger
 * /api/purchase-orders/{id}/order:
 *   patch:
 *     summary: Mark purchase order as ordered
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/order', authenticate, checkPermission('purchase_orders:update'), purchaseOrderController.markAsOrdered);

/**
 * @swagger
 * /api/purchase-orders/{id}/receive:
 *   patch:
 *     summary: Receive items from purchase order
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/receive', authenticate, checkPermission('purchase_orders:update'), purchaseOrderController.receiveItems);

/**
 * @swagger
 * /api/purchase-orders/{id}/cancel:
 *   patch:
 *     summary: Cancel purchase order
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/cancel', authenticate, checkPermission('purchase_orders:update'), purchaseOrderController.cancel);

export default router;
