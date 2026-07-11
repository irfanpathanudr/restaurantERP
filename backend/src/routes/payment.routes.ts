import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreatePaymentDto } from '../dto/payment/CreatePaymentDto';

const router = Router();
const paymentController = new PaymentController();

router.use(authenticate);

router.get('/', checkPermission('payments.read'), paymentController.findAll);
router.get('/:id', checkPermission('payments.read'), paymentController.findById);
router.post('/', checkPermission('payments.create'), validateDTO(CreatePaymentDto), paymentController.create);
router.post('/:id/refund', checkPermission('payments.refund'), paymentController.refund);

export default router;
