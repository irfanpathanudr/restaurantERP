import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from '../services/expense.service';
import { ExpenseStatus } from '../database/entities/Expense.entity';

export class ExpenseController {
  private expenseService = new ExpenseService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const expense = await this.expenseService.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, category, status, startDate, endDate, search } = req.query;
      const expenses = await this.expenseService.findAll({
        branchId: branchId as string,
        category: category as string,
        status: status as ExpenseStatus,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        search: search as string,
      });
      res.status(200).json({
        success: true,
        message: 'Expenses retrieved successfully',
        data: expenses,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const expense = await this.expenseService.findById(id);
      if (!expense) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Expense retrieved successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  findByExpenseNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { expenseNumber } = req.params;
      const expense = await this.expenseService.findByExpenseNumber(expenseNumber);
      if (!expense) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Expense retrieved successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const expense = await this.expenseService.update(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      await this.expenseService.delete(id, userId);
      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const expense = await this.expenseService.approve(id, userId);
      res.status(200).json({
        success: true,
        message: 'Expense approved successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user?.id;
      const expense = await this.expenseService.reject(id, userId, reason);
      res.status(200).json({
        success: true,
        message: 'Expense rejected successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsPaid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const expense = await this.expenseService.markAsPaid(id);
      res.status(200).json({
        success: true,
        message: 'Expense marked as paid successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  getTotalExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query;
      const total = await this.expenseService.getTotalExpenses(
        branchId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.status(200).json({
        success: true,
        message: 'Total expenses calculated successfully',
        data: { total },
      });
    } catch (error) {
      next(error);
    }
  };

  getExpensesByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query;
      const expenses = await this.expenseService.getExpensesByCategory(
        branchId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.status(200).json({
        success: true,
        message: 'Expenses by category retrieved successfully',
        data: expenses,
      });
    } catch (error) {
      next(error);
    }
  };
}
