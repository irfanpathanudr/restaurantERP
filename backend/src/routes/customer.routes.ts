import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateCustomerDto } from '../dto/customer/CreateCustomerDto';
import { UpdateCustomerDto } from '../dto/customer/UpdateCustomerDto';

const router = Router();
const customerController = new CustomerController();

router.use(authenticate);

router.get('/', checkPermission('customers.read'), customerController.findAll);
router.get('/:id', checkPermission('customers.read'), customerController.findById);
router.post('/', checkPermission('customers.create'), validateDTO(CreateCustomerDto), customerController.create);
router.put('/:id', checkPermission('customers.update'), validateDTO(UpdateCustomerDto), customerController.update);
router.delete('/:id', checkPermission('customers.delete'), customerController.delete);
router.get('/:id/orders', checkPermission('customers.read'), customerController.getCustomerOrders);

export default router;
