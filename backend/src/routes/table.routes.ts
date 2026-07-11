import { Router } from 'express';
import { TableController } from '../controllers/table.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateTableDto } from '../dto/table/CreateTableDto';
import { UpdateTableDto } from '../dto/table/UpdateTableDto';

const router = Router();
const tableController = new TableController();

router.use(authenticate);

router.get('/', checkPermission('tables.read'), tableController.findAll);
router.get('/:id', checkPermission('tables.read'), tableController.findById);
router.post('/', checkPermission('tables.create'), validateDTO(CreateTableDto), tableController.create);
router.put('/:id', checkPermission('tables.update'), validateDTO(UpdateTableDto), tableController.update);
router.delete('/:id', checkPermission('tables.delete'), tableController.delete);
router.patch('/:id/status', checkPermission('tables.update'), tableController.changeStatus);

export default router;
