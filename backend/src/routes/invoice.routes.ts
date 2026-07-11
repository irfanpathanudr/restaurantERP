import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateInvoiceDto } from '../dto/invoice/CreateInvoiceDto';

const router = Router();
const invoiceController = new InvoiceController();

router.use(authenticate);

router.get('/', checkPermission('invoices.read'), invoiceController.findAll);
router.get('/:id', checkPermission('invoices.read'), invoiceController.findById);
router.post('/', checkPermission('invoices.create'), validateDTO(CreateInvoiceDto), invoiceController.create);
router.get('/:id/pdf', checkPermission('invoices.read'), invoiceController.generatePDF);
router.post('/:id/send-email', checkPermission('invoices.update'), invoiceController.sendEmail);

export default router;
