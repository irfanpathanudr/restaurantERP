import AppDataSource from '../config/database';
import { Order } from '../database/entities/Order.entity';
import { Payment } from '../database/entities/Payment.entity';
import { Expense } from '../database/entities/Expense.entity';
import { Invoice } from '../database/entities/Invoice.entity';
import { MenuItem } from '../database/entities/MenuItem.entity';
import { Employee } from '../database/entities/Employee.entity';
import { Vendor } from '../database/entities/Vendor.entity';
import { PurchaseOrder } from '../database/entities/PurchaseOrder.entity';
import logger from '../config/logger';
import { Between, Repository } from 'typeorm';

export class ReportService {
  private get orderRepository(): Repository<Order> {
    return AppDataSource.getRepository(Order);
  }

  private get paymentRepository(): Repository<Payment> {
    return AppDataSource.getRepository(Payment);
  }

  private get expenseRepository(): Repository<Expense> {
    return AppDataSource.getRepository(Expense);
  }

  private get invoiceRepository(): Repository<Invoice> {
    return AppDataSource.getRepository(Invoice);
  }

  private get menuItemRepository(): Repository<MenuItem> {
    return AppDataSource.getRepository(MenuItem);
  }

  private get employeeRepository(): Repository<Employee> {
    return AppDataSource.getRepository(Employee);
  }

  private get vendorRepository(): Repository<Vendor> {
    return AppDataSource.getRepository(Vendor);
  }

  private get purchaseOrderRepository(): Repository<PurchaseOrder> {
    return AppDataSource.getRepository(PurchaseOrder);
  }

  /**
   * Get sales report for a date range
   */
  async getSalesReport(startDate: Date, endDate: Date, branchId?: string) {
    try {
      const query = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.payments', 'payment')
        .where('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate });

      if (branchId) {
        query.andWhere('order.branch_id = :branchId', { branchId });
      }

      const orders = await query.getMany();

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const totalTax = orders.reduce((sum, order) => sum + Number(order.tax_amount), 0);
      const totalDiscount = orders.reduce((sum, order) => sum + Number(order.discount_amount || 0), 0);

      const paidOrders = orders.filter(o => {
        const totalPaid = o.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        return totalPaid >= Number(o.total_amount);
      });

      return {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        total_orders: totalOrders,
        completed_orders: orders.filter(o => o.order_status === 'COMPLETED').length,
        cancelled_orders: orders.filter(o => o.order_status === 'CANCELLED').length,
        total_revenue: totalRevenue,
        total_tax: totalTax,
        total_discount: totalDiscount,
        net_revenue: totalRevenue - totalDiscount,
        paid_orders: paidOrders.length,
        average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      };
    } catch (error) {
      logger.error('Error generating sales report:', error);
      throw error;
    }
  }

  /**
   * Get payment report for a date range
   */
  async getPaymentReport(startDate: Date, endDate: Date, branchId?: string) {
    try {
      const query = this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.order', 'order')
        .where('payment.payment_date BETWEEN :startDate AND :endDate', { startDate, endDate });

      if (branchId) {
        query.andWhere('order.branch_id = :branchId', { branchId });
      }

      const payments = await query.getMany();

      const paymentsByMethod = payments.reduce((acc, payment) => {
        const method = payment.payment_method;
        if (!acc[method]) {
          acc[method] = {
            count: 0,
            total_amount: 0,
          };
        }
        acc[method].count++;
        acc[method].total_amount += Number(payment.amount);
        return acc;
      }, {} as Record<string, { count: number; total_amount: number }>);

      const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        total_payments: payments.length,
        total_amount: totalAmount,
        payments_by_method: paymentsByMethod,
        successful_payments: payments.filter(p => p.payment_status === 'COMPLETED').length,
        failed_payments: payments.filter(p => p.payment_status === 'FAILED').length,
        pending_payments: payments.filter(p => p.payment_status === 'PENDING').length,
      };
    } catch (error) {
      logger.error('Error generating payment report:', error);
      throw error;
    }
  }

  /**
   * Get expense report for a date range
   */
  async getExpenseReport(startDate: Date, endDate: Date, branchId?: string) {
    try {
      const query = this.expenseRepository
        .createQueryBuilder('expense')
        .where('expense.expense_date BETWEEN :startDate AND :endDate', { startDate, endDate });

      if (branchId) {
        query.andWhere('expense.branch_id = :branchId', { branchId });
      }

      const expenses = await query.getMany();

      const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category;
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            total_amount: 0,
          };
        }
        acc[category].count++;
        acc[category].total_amount += Number(expense.amount);
        return acc;
      }, {} as Record<string, { count: number; total_amount: number }>);

      const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        total_expenses: expenses.length,
        total_amount: totalAmount,
        expenses_by_category: expensesByCategory,
        approved_expenses: expenses.filter(e => e.approval_status === 'APPROVED').length,
        pending_expenses: expenses.filter(e => e.approval_status === 'PENDING').length,
        rejected_expenses: expenses.filter(e => e.approval_status === 'REJECTED').length,
      };
    } catch (error) {
      logger.error('Error generating expense report:', error);
      throw error;
    }
  }

  /**
   * Get profit/loss report
   */
  async getProfitLossReport(startDate: Date, endDate: Date, branchId?: string) {
    try {
      const salesReport = await this.getSalesReport(startDate, endDate, branchId);
      const expenseReport = await this.getExpenseReport(startDate, endDate, branchId);

      // Get purchase orders for the period
      const poQuery = this.purchaseOrderRepository
        .createQueryBuilder('po')
        .where('po.order_date BETWEEN :startDate AND :endDate', { startDate, endDate });

      if (branchId) {
        poQuery.andWhere('po.branch_id = :branchId', { branchId });
      }

      const purchaseOrders = await poQuery.getMany();
      const totalPurchases = purchaseOrders.reduce((sum, po) => sum + Number(po.total_amount), 0);

      const totalRevenue = salesReport.net_revenue;
      const totalExpenses = expenseReport.total_amount;
      const costOfGoods = totalPurchases;
      const grossProfit = totalRevenue - costOfGoods;
      const netProfit = grossProfit - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        total_revenue: totalRevenue,
        cost_of_goods_sold: costOfGoods,
        gross_profit: grossProfit,
        gross_profit_margin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        net_profit_margin: profitMargin,
      };
    } catch (error) {
      logger.error('Error generating profit/loss report:', error);
      throw error;
    }
  }

  /**
   * Get top-selling items report
   */
  async getTopSellingItems(startDate: Date, endDate: Date, branchId?: string, limit: number = 10) {
    try {
      const query = `
        SELECT 
          mi.id,
          mi.name,
          mi.sku,
          COUNT(oi.id) as order_count,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total_price) as total_revenue
        FROM order_items oi
        INNER JOIN menu_items mi ON oi.menu_item_id = mi.id
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at BETWEEN ? AND ?
        ${branchId ? 'AND o.branch_id = ?' : ''}
        GROUP BY mi.id, mi.name, mi.sku
        ORDER BY total_quantity DESC
        LIMIT ?
      `;

      const params = branchId 
        ? [startDate, endDate, branchId, limit]
        : [startDate, endDate, limit];

      const topItems = await AppDataSource.query(query, params);

      return {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        items: topItems,
      };
    } catch (error) {
      logger.error('Error generating top selling items report:', error);
      throw error;
    }
  }

  /**
   * Get employee performance report
   */
  async getEmployeePerformanceReport(startDate: Date, endDate: Date, branchId?: string) {
    try {
      const query = `
        SELECT 
          e.id,
          e.first_name,
          e.last_name,
          e.employee_code,
          COUNT(DISTINCT o.id) as orders_handled,
          SUM(o.total_amount) as total_sales,
          AVG(o.total_amount) as average_order_value
        FROM employees e
        LEFT JOIN orders o ON o.created_by = e.id
        WHERE o.created_at BETWEEN ? AND ?
        ${branchId ? 'AND e.branch_id = ?' : ''}
        GROUP BY e.id, e.first_name, e.last_name, e.employee_code
        ORDER BY total_sales DESC
      `;

      const params = branchId 
        ? [startDate, endDate, branchId]
        : [startDate, endDate];

      const performance = await AppDataSource.query(query, params);

      return {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        employees: performance,
      };
    } catch (error) {
      logger.error('Error generating employee performance report:', error);
      throw error;
    }
  }

  /**
   * Get vendor performance report
   */
  async getVendorPerformanceReport(startDate: Date, endDate: Date) {
    try {
      const query = `
        SELECT 
          v.id,
          v.name,
          v.vendor_code,
          v.rating,
          COUNT(po.id) as total_orders,
          SUM(po.total_amount) as total_purchases,
          AVG(po.total_amount) as average_order_value,
          v.current_balance as outstanding_balance
        FROM vendors v
        LEFT JOIN purchase_orders po ON po.vendor_id = v.id
        WHERE po.order_date BETWEEN ? AND ?
        GROUP BY v.id, v.name, v.vendor_code, v.rating, v.current_balance
        ORDER BY total_purchases DESC
      `;

      const vendors = await AppDataSource.query(query, [startDate, endDate]);

      return {
        start_date: startDate,
        end_date: endDate,
        vendors,
      };
    } catch (error) {
      logger.error('Error generating vendor performance report:', error);
      throw error;
    }
  }

  /**
   * Get daily sales summary
   */
  async getDailySalesSummary(startDate: Date, endDate: Date, branchId?: string) {
    try {
      const query = `
        SELECT 
          DATE(o.created_at) as sale_date,
          COUNT(o.id) as order_count,
          SUM(o.total_amount) as total_sales,
          AVG(o.total_amount) as average_order_value,
          SUM(o.tax_amount) as total_tax
        FROM orders o
        WHERE o.created_at BETWEEN ? AND ?
        ${branchId ? 'AND o.branch_id = ?' : ''}
        GROUP BY DATE(o.created_at)
        ORDER BY sale_date ASC
      `;

      const params = branchId 
        ? [startDate, endDate, branchId]
        : [startDate, endDate];

      const dailySummary = await AppDataSource.query(query, params);

      return {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        daily_summary: dailySummary,
      };
    } catch (error) {
      logger.error('Error generating daily sales summary:', error);
      throw error;
    }
  }
}
