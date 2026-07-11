import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateRestaurantDto } from '../dto/restaurant/CreateRestaurantDto';
import { UpdateRestaurantDto } from '../dto/restaurant/UpdateRestaurantDto';

const router = Router();
const restaurantController = new RestaurantController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurants retrieved successfully
 */
router.get('/', checkPermission('restaurants.read'), restaurantController.findAll);

/**
 * @swagger
 * /api/v1/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
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
 *         description: Restaurant retrieved successfully
 */
router.get('/:id', checkPermission('restaurants.read'), restaurantController.findById);

/**
 * @swagger
 * /api/v1/restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 */
router.post('/', checkPermission('restaurants.create'), validateDTO(CreateRestaurantDto), restaurantController.create);

/**
 * @swagger
 * /api/v1/restaurants/{id}:
 *   put:
 *     summary: Update restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 */
router.put('/:id', checkPermission('restaurants.update'), validateDTO(UpdateRestaurantDto), restaurantController.update);

/**
 * @swagger
 * /api/v1/restaurants/{id}:
 *   delete:
 *     summary: Delete restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 */
router.delete('/:id', checkPermission('restaurants.delete'), restaurantController.delete);

export default router;
