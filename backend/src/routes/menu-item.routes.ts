import { Router } from 'express';
import { MenuItemController } from '../controllers/menu-item.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateMenuItemDto } from '../dto/menu-item/CreateMenuItemDto';
import { UpdateMenuItemDto } from '../dto/menu-item/UpdateMenuItemDto';

const router = Router();
const menuItemController = new MenuItemController();

router.use(authenticate);

router.get('/search', checkPermission('menu.read'), menuItemController.search);
router.get('/with-images', checkPermission('menu.read'), menuItemController.getWithImages);
router.get('/', checkPermission('menu.read'), menuItemController.findAll);
router.get('/:id', checkPermission('menu.read'), menuItemController.findById);
router.post('/', checkPermission('menu.create'), validateDTO(CreateMenuItemDto), menuItemController.create);
router.put('/:id', checkPermission('menu.update'), validateDTO(UpdateMenuItemDto), menuItemController.update);
router.delete('/:id', checkPermission('menu.delete'), menuItemController.delete);
router.patch('/:id/availability', checkPermission('menu.update'), menuItemController.toggleAvailability);

export default router;
