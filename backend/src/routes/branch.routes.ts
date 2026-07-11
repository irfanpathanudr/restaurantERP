import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateBranchDto } from '../dto/branch/CreateBranchDto';
import { UpdateBranchDto } from '../dto/branch/UpdateBranchDto';

const router = Router();
const branchController = new BranchController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     summary: Get all branches
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Branches retrieved successfully
 */
router.get('/', checkPermission('branches.read'), branchController.findAll);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Branch retrieved successfully
 */
router.get('/:id', checkPermission('branches.read'), branchController.findById);

/**
 * @swagger
 * /api/v1/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Branch created successfully
 */
router.post('/', checkPermission('branches.create'), validateDTO(CreateBranchDto), branchController.create);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   put:
 *     summary: Update branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Branch updated successfully
 */
router.put('/:id', checkPermission('branches.update'), validateDTO(UpdateBranchDto), branchController.update);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   delete:
 *     summary: Delete branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 */
router.delete('/:id', checkPermission('branches.delete'), branchController.delete);

export default router;
