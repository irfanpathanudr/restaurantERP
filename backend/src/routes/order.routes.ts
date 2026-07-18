import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateOrderDto } from '../dto/order/CreateOrderDto';
import { UpdateOrderDto } from '../dto/order/UpdateOrderDto';
import { AddOrderItemsDto } from '../dto/order/AddOrderItemsDto';
import { ApplyDiscountDto } from '../dto/order/ApplyDiscountDto';

const router = Router();
const orderController = new OrderController();

router.use(authenticate);

router.get('/', checkPermission('orders.read'), orderController.findAll);
router.get('/table/:tableId/active', checkPermission('orders.read'), orderController.findActiveByTable);
router.get('/:id', checkPermission('orders.read'), orderController.findById);
router.post('/', checkPermission('orders.create'), validateDTO(CreateOrderDto), orderController.create);
router.put('/:id', checkPermission('orders.update'), validateDTO(UpdateOrderDto), orderController.update);
router.post(
  '/:id/items',
  checkPermission('orders.update'),
  validateDTO(AddOrderItemsDto),
  orderController.addItems
);
router.patch('/:id/items/:itemId', checkPermission('orders.update'), orderController.updateItemQuantity);
router.delete('/:id/items/:itemId', checkPermission('orders.update'), orderController.removeItem);
router.patch('/:id/status', checkPermission('orders.update'), orderController.changeStatus);
router.post('/:id/complete', checkPermission('orders.update'), orderController.completeOrder);
router.post('/:id/cancel', checkPermission('orders.update'), orderController.cancelOrder);
router.post('/:id/discount', checkPermission('orders.update'), validateDTO(ApplyDiscountDto), orderController.applyDiscount);
router.post('/:id/confirm', checkPermission('orders.confirm'), orderController.confirmByCashier);

export default router;
