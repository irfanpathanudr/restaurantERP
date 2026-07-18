import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const kitchenController = new KitchenController();

router.post('/', authenticate, checkPermission('kitchens.create'), kitchenController.create);
router.get('/', authenticate, checkPermission('kitchens.read'), kitchenController.findAll);
router.get('/:id', authenticate, checkPermission('kitchens.read'), kitchenController.findById);
router.get(
  '/branch/:branchId/code/:code',
  authenticate,
  checkPermission('kitchens.read'),
  kitchenController.findByCode
);
router.put('/:id', authenticate, checkPermission('kitchens.update'), kitchenController.update);
router.delete('/:id', authenticate, checkPermission('kitchens.delete'), kitchenController.delete);
router.patch(
  '/:id/sort-order',
  authenticate,
  checkPermission('kitchens.update'),
  kitchenController.updateSortOrder
);

export default router;
