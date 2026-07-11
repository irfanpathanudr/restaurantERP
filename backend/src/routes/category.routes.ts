import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateCategoryDto } from '../dto/category/CreateCategoryDto';
import { UpdateCategoryDto } from '../dto/category/UpdateCategoryDto';

const router = Router();
const categoryController = new CategoryController();

router.use(authenticate);

router.get('/', checkPermission('menu.read'), categoryController.findAll);
router.get('/:id', checkPermission('menu.read'), categoryController.findById);
router.post('/', checkPermission('menu.create'), validateDTO(CreateCategoryDto), categoryController.create);
router.put('/:id', checkPermission('menu.update'), validateDTO(UpdateCategoryDto), categoryController.update);
router.delete('/:id', checkPermission('menu.delete'), categoryController.delete);

export default router;
