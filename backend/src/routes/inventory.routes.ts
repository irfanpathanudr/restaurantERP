import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateRawMaterialDto } from '../dto/inventory/CreateRawMaterialDto';
import { UpdateRawMaterialDto } from '../dto/inventory/UpdateRawMaterialDto';

const router = Router();
const inventoryController = new InventoryController();

router.use(authenticate);

router.get('/', checkPermission('inventory.read'), inventoryController.findAll);
router.get('/:id', checkPermission('inventory.read'), inventoryController.findById);
router.post('/', checkPermission('inventory.create'), validateDTO(CreateRawMaterialDto), inventoryController.create);
router.put('/:id', checkPermission('inventory.update'), validateDTO(UpdateRawMaterialDto), inventoryController.update);
router.delete('/:id', checkPermission('inventory.delete'), inventoryController.delete);
router.post('/:id/adjust-stock', checkPermission('inventory.update'), inventoryController.adjustStock);
router.get('/low-stock/alert', checkPermission('inventory.read'), inventoryController.getLowStockItems);

export default router;
