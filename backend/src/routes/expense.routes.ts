import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();
const expenseController = new ExpenseController();

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, checkPermission('expenses:create'), expenseController.create);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkPermission('expenses:read'), expenseController.findAll);

/**
 * @swagger
 * /api/expenses/total:
 *   get:
 *     summary: Get total expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/total', authenticate, checkPermission('expenses:read'), expenseController.getTotalExpenses);

/**
 * @swagger
 * /api/expenses/by-category:
 *   get:
 *     summary: Get expenses grouped by category
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/by-category', authenticate, checkPermission('expenses:read'), expenseController.getExpensesByCategory);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, checkPermission('expenses:read'), expenseController.findById);

/**
 * @swagger
 * /api/expenses/number/{expenseNumber}:
 *   get:
 *     summary: Get expense by expense number
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/number/:expenseNumber', authenticate, checkPermission('expenses:read'), expenseController.findByExpenseNumber);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, checkPermission('expenses:update'), expenseController.update);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, checkPermission('expenses:delete'), expenseController.delete);

/**
 * @swagger
 * /api/expenses/{id}/approve:
 *   patch:
 *     summary: Approve expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/approve', authenticate, checkPermission('expenses:approve'), expenseController.approve);

/**
 * @swagger
 * /api/expenses/{id}/reject:
 *   patch:
 *     summary: Reject expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/reject', authenticate, checkPermission('expenses:approve'), expenseController.reject);

/**
 * @swagger
 * /api/expenses/{id}/mark-paid:
 *   patch:
 *     summary: Mark expense as paid
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/mark-paid', authenticate, checkPermission('expenses:update'), expenseController.markAsPaid);

export default router;
