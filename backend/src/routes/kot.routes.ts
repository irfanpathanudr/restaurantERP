import { Router } from 'express';
import { KOTController } from '../controllers/kot.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateKOTDto } from '../dto/kot/CreateKOTDto';
import { UpdateKOTDto } from '../dto/kot/UpdateKOTDto';

const router = Router();
const kotController = new KOTController();

router.use(authenticate);

router.get('/', checkPermission('kot.read'), kotController.findAll);
router.get('/:id', checkPermission('kot.read'), kotController.findById);
router.post('/', checkPermission('kot.create'), validateDTO(CreateKOTDto), kotController.create);
router.patch('/:id/status', checkPermission('kot.update'), kotController.changeStatus);
router.post('/:id/complete', checkPermission('kot.update'), kotController.completeKOT);

export default router;
