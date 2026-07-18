import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreatePaymentDto } from '../dto/payment/CreatePaymentDto';
import { SplitPaymentDto } from '../dto/payment/SplitPaymentDto';

const router = Router();
const paymentController = new PaymentController();

router.use(authenticate);

router.get('/', checkPermission('payments.read'), paymentController.findAll);
router.get('/:id', checkPermission('payments.read'), paymentController.findById);
router.get('/order/:orderId', checkPermission('payments.read'), paymentController.getOrderPayments);
router.post('/', checkPermission('payments.create'), validateDTO(CreatePaymentDto), paymentController.create);
router.post('/split', checkPermission('payments.create'), validateDTO(SplitPaymentDto), paymentController.processSplitPayment);
router.post('/:id/refund', checkPermission('payments.refund'), paymentController.refund);

export default router;
