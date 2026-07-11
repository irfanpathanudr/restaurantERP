import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const recipeController = new RecipeController();

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - menu_item_id
 *               - ingredients
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               menu_item_id:
 *                 type: string
 *               preparation_time:
 *                 type: integer
 *               cooking_time:
 *                 type: integer
 *               serving_size:
 *                 type: integer
 *               preparation_steps:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     raw_material_id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *                     cost:
 *                       type: number
 *                     sort_order:
 *                       type: integer
 *                     preparation_notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, checkPermission('recipes:create'), recipeController.create);

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: menuItemId
 *         schema:
 *           type: string
 *         description: Filter by menu item ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or code
 *     responses:
 *       200:
 *         description: Recipes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, checkPermission('recipes:read'), recipeController.findAll);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     tags: [Recipes]
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
 *         description: Recipe retrieved successfully
 *       404:
 *         description: Recipe not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, checkPermission('recipes:read'), recipeController.findById);

/**
 * @swagger
 * /api/recipes/menu-item/{menuItemId}:
 *   get:
 *     summary: Get recipe by menu item ID
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
 *       404:
 *         description: Recipe not found
 *       401:
 *         description: Unauthorized
 */
router.get('/menu-item/:menuItemId', authenticate, checkPermission('recipes:read'), recipeController.findByMenuItemId);

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       404:
 *         description: Recipe not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticate, checkPermission('recipes:update'), recipeController.update);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete recipe
 *     tags: [Recipes]
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
 *         description: Recipe deleted successfully
 *       404:
 *         description: Recipe not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, checkPermission('recipes:delete'), recipeController.delete);

/**
 * @swagger
 * /api/recipes/{id}/calculate-cost:
 *   post:
 *     summary: Calculate recipe cost
 *     tags: [Recipes]
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
 *         description: Recipe cost calculated successfully
 *       404:
 *         description: Recipe not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/calculate-cost', authenticate, checkPermission('recipes:read'), recipeController.calculateCost);

export default router;
