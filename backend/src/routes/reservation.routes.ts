import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const reservationController = new ReservationController();

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, checkPermission('reservations:create'), reservationController.create);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Get all reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkPermission('reservations:read'), reservationController.findAll);

/**
 * @swagger
 * /api/reservations/upcoming:
 *   get:
 *     summary: Get upcoming reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/upcoming', authenticate, checkPermission('reservations:read'), reservationController.getUpcoming);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Get reservation by ID
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, checkPermission('reservations:read'), reservationController.findById);

/**
 * @swagger
 * /api/reservations/number/{reservationNumber}:
 *   get:
 *     summary: Get reservation by reservation number
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/number/:reservationNumber', authenticate, checkPermission('reservations:read'), reservationController.findByReservationNumber);

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Update reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, checkPermission('reservations:update'), reservationController.update);

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Delete reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, checkPermission('reservations:delete'), reservationController.delete);

/**
 * @swagger
 * /api/reservations/{id}/confirm:
 *   patch:
 *     summary: Confirm reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/confirm', authenticate, checkPermission('reservations:update'), reservationController.confirm);

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   patch:
 *     summary: Cancel reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/cancel', authenticate, checkPermission('reservations:update'), reservationController.cancel);

/**
 * @swagger
 * /api/reservations/{id}/check-in:
 *   patch:
 *     summary: Check in reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/check-in', authenticate, checkPermission('reservations:update'), reservationController.checkIn);

/**
 * @swagger
 * /api/reservations/{id}/no-show:
 *   patch:
 *     summary: Mark reservation as no-show
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/no-show', authenticate, checkPermission('reservations:update'), reservationController.markAsNoShow);

/**
 * @swagger
 * /api/reservations/{id}/assign-table:
 *   patch:
 *     summary: Assign table to reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/assign-table', authenticate, checkPermission('reservations:update'), reservationController.assignTable);

export default router;
