import AppDataSource from '../config/database';
import { Expense, ExpenseStatus } from '../database/entities/Expense.entity';
import { CreateExpenseDto } from '../dto/expense/CreateExpenseDto';
import { UpdateExpenseDto } from '../dto/expense/UpdateExpenseDto';
import logger from '../config/logger';
import { Repository, Between } from 'typeorm';

export class ExpenseService {
  private get expenseRepository(): Repository<Expense> {
    return AppDataSource.getRepository(Expense);
  }

  async create(data: CreateExpenseDto, createdBy?: string): Promise<Expense> {
    try {
      const expense = this.expenseRepository.create({
        ...data,
        created_by: createdBy,
      });
      await this.expenseRepository.save(expense);
      logger.info(`Expense created: ${expense.id}`);
      return expense;
    } catch (error) {
      logger.error('Error creating expense:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    branchId?: string;
    category?: string;
    status?: ExpenseStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }): Promise<Expense[]> {
    try {
      const query = this.expenseRepository
        .createQueryBuilder('expense')
        .leftJoinAndSelect('expense.branch', 'branch')
        .orderBy('expense.expense_date', 'DESC')
        .addOrderBy('expense.created_at', 'DESC');

      if (filters?.branchId) {
        query.andWhere('expense.branch_id = :branchId', { branchId: filters.branchId });
      }

      if (filters?.category) {
        query.andWhere('expense.category = :category', { category: filters.category });
      }

      if (filters?.status) {
        query.andWhere('expense.expense_status = :status', { status: filters.status });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('expense.expense_date BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }

      if (filters?.search) {
        query.andWhere(
          '(expense.title LIKE :search OR expense.expense_number LIKE :search OR expense.vendor_name LIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching expenses:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Expense | null> {
    try {
      return await this.expenseRepository.findOne({
        where: { id },
        relations: ['branch'],
      });
    } catch (error) {
      logger.error(`Error fetching expense ${id}:`, error);
      throw error;
    }
  }

  async findByExpenseNumber(expenseNumber: string): Promise<Expense | null> {
    try {
      return await this.expenseRepository.findOne({
        where: { expense_number: expenseNumber },
        relations: ['branch'],
      });
    } catch (error) {
      logger.error(`Error fetching expense with number ${expenseNumber}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateExpenseDto, updatedBy?: string): Promise<Expense> {
    try {
      const expense = await this.expenseRepository.findOne({ where: { id } });
      if (!expense) {
        throw new Error('Expense not found');
      }

      Object.assign(expense, data);
      if (updatedBy) {
        expense.updated_by = updatedBy;
      }
      await this.expenseRepository.save(expense);
      logger.info(`Expense updated: ${id}`);
      return expense;
    } catch (error) {
      logger.error(`Error updating expense ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    try {
      const expense = await this.expenseRepository.findOne({ where: { id } });
      if (!expense) {
        throw new Error('Expense not found');
      }

      if (deletedBy) {
        expense.deleted_by = deletedBy;
      }
      await this.expenseRepository.softRemove(expense);
      logger.info(`Expense deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting expense ${id}:`, error);
      throw error;
    }
  }

  async approve(id: string, approvedBy: string): Promise<Expense> {
    try {
      const expense = await this.expenseRepository.findOne({ where: { id } });
      if (!expense) {
        throw new Error('Expense not found');
      }

      expense.expense_status = ExpenseStatus.APPROVED;
      expense.approved_by = approvedBy;
      expense.approved_at = new Date();
      await this.expenseRepository.save(expense);
      logger.info(`Expense approved: ${id} by ${approvedBy}`);
      return expense;
    } catch (error) {
      logger.error(`Error approving expense ${id}:`, error);
      throw error;
    }
  }

  async reject(id: string, approvedBy: string, reason: string): Promise<Expense> {
    try {
      const expense = await this.expenseRepository.findOne({ where: { id } });
      if (!expense) {
        throw new Error('Expense not found');
      }

      expense.expense_status = ExpenseStatus.REJECTED;
      expense.approved_by = approvedBy;
      expense.approved_at = new Date();
      expense.rejection_reason = reason;
      await this.expenseRepository.save(expense);
      logger.info(`Expense rejected: ${id} by ${approvedBy}`);
      return expense;
    } catch (error) {
      logger.error(`Error rejecting expense ${id}:`, error);
      throw error;
    }
  }

  async markAsPaid(id: string): Promise<Expense> {
    try {
      const expense = await this.expenseRepository.findOne({ where: { id } });
      if (!expense) {
        throw new Error('Expense not found');
      }

      expense.expense_status = ExpenseStatus.PAID;
      await this.expenseRepository.save(expense);
      logger.info(`Expense marked as paid: ${id}`);
      return expense;
    } catch (error) {
      logger.error(`Error marking expense as paid ${id}:`, error);
      throw error;
    }
  }

  async getTotalExpenses(branchId?: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      const query = this.expenseRepository
        .createQueryBuilder('expense')
        .select('SUM(expense.amount)', 'total')
        .where('expense.expense_status = :status', { status: ExpenseStatus.PAID });

      if (branchId) {
        query.andWhere('expense.branch_id = :branchId', { branchId });
      }

      if (startDate && endDate) {
        query.andWhere('expense.expense_date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }

      const result = await query.getRawOne();
      return parseFloat(result.total) || 0;
    } catch (error) {
      logger.error('Error calculating total expenses:', error);
      throw error;
    }
  }

  async getExpensesByCategory(branchId?: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      const query = this.expenseRepository
        .createQueryBuilder('expense')
        .select('expense.category', 'category')
        .addSelect('SUM(expense.amount)', 'total')
        .addSelect('COUNT(expense.id)', 'count')
        .where('expense.expense_status = :status', { status: ExpenseStatus.PAID })
        .groupBy('expense.category')
        .orderBy('total', 'DESC');

      if (branchId) {
        query.andWhere('expense.branch_id = :branchId', { branchId });
      }

      if (startDate && endDate) {
        query.andWhere('expense.expense_date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }

      return await query.getRawMany();
    } catch (error) {
      logger.error('Error fetching expenses by category:', error);
      throw error;
    }
  }
}
