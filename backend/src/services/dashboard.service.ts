import AppDataSource from '../config/database';
import { Order } from '../database/entities/Order.entity';
import { Payment } from '../database/entities/Payment.entity';
import { Expense } from '../database/entities/Expense.entity';
import { Customer } from '../database/entities/Customer.entity';
import { Reservation } from '../database/entities/Reservation.entity';
import { RawMaterial } from '../database/entities/RawMaterial.entity';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class DashboardService {
  private get orderRepository(): Repository<Order> {
    return AppDataSource.getRepository(Order);
  }

  private get paymentRepository(): Repository<Payment> {
    return AppDataSource.getRepository(Payment);
  }

  private get expenseRepository(): Repository<Expense> {
    return AppDataSource.getRepository(Expense);
  }

  private get customerRepository(): Repository<Customer> {
    return AppDataSource.getRepository(Customer);
  }

  private get reservationRepository(): Repository<Reservation> {
    return AppDataSource.getRepository(Reservation);
  }

  private get rawMaterialRepository(): Repository<RawMaterial> {
    return AppDataSource.getRepository(RawMaterial);
  }

  /**
   * Get overview statistics for dashboard
   */
  async getOverview(branchId?: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Today's orders
      const todayOrdersQuery = this.orderRepository
        .createQueryBuilder('order')
        .where('order.created_at >= :today', { today })
        .andWhere('order.created_at < :tomorrow', { tomorrow });

      if (branchId) {
        todayOrdersQuery.andWhere('order.branch_id = :branchId', { branchId });
      }

      const todayOrders = await todayOrdersQuery.getMany();
      const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

      // Yesterday's comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayOrdersQuery = this.orderRepository
        .createQueryBuilder('order')
        .where('order.created_at >= :yesterday', { yesterday })
        .andWhere('order.created_at < :today', { today });

      if (branchId) {
        yesterdayOrdersQuery.andWhere('order.branch_id = :branchId', { branchId });
      }

      const yesterdayOrders = await yesterdayOrdersQuery.getMany();
      const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

      // Today's payments
      const todayPaymentsQuery = this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.order', 'order')
        .where('payment.payment_date >= :today', { today })
        .andWhere('payment.payment_date < :tomorrow', { tomorrow });

      if (branchId) {
        todayPaymentsQuery.andWhere('order.branch_id = :branchId', { branchId });
      }

      const todayPayments = await todayPaymentsQuery.getMany();
      const todayPaymentAmount = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Today's expenses
      const todayExpensesQuery = this.expenseRepository
        .createQueryBuilder('expense')
        .where('expense.expense_date >= :today', { today })
        .andWhere('expense.expense_date < :tomorrow', { tomorrow });

      if (branchId) {
        todayExpensesQuery.andWhere('expense.branch_id = :branchId', { branchId });
      }

      const todayExpenses = await todayExpensesQuery.getMany();
      const todayExpenseAmount = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      // Active orders (not completed/cancelled)
      const activeOrdersQuery = this.orderRepository
        .createQueryBuilder('order')
        .where('order.order_status NOT IN (:...statuses)', { statuses: ['COMPLETED', 'CANCELLED'] });

      if (branchId) {
        activeOrdersQuery.andWhere('order.branch_id = :branchId', { branchId });
      }

      const activeOrders = await activeOrdersQuery.getCount();

      // Total customers
      const totalCustomers = await this.customerRepository.count();

      // Today's reservations
      const todayReservationsQuery = this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.reservation_date >= :today', { today })
        .andWhere('reservation.reservation_date < :tomorrow', { tomorrow });

      if (branchId) {
        todayReservationsQuery.andWhere('reservation.branch_id = :branchId', { branchId });
      }

      const todayReservations = await todayReservationsQuery.getCount();

      // Calculate percentage changes
      const revenueChange = yesterdayRevenue > 0 
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
        : 0;

      const ordersChange = yesterdayOrders.length > 0
        ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100
        : 0;

      return {
        today_revenue: todayRevenue,
        today_orders: todayOrders.length,
        today_payments: todayPaymentAmount,
        today_expenses: todayExpenseAmount,
        today_net_income: todayRevenue - todayExpenseAmount,
        active_orders: activeOrders,
        total_customers: totalCustomers,
        today_reservations: todayReservations,
        revenue_change_percentage: revenueChange,
        orders_change_percentage: ordersChange,
        yesterday_revenue: yesterdayRevenue,
        yesterday_orders: yesterdayOrders.length,
      };
    } catch (error) {
      logger.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(branchId?: string, limit: number = 10) {
    try {
      const query = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.table', 'table')
        .leftJoinAndSelect('order.customer', 'customer')
        .orderBy('order.created_at', 'DESC')
        .take(limit);

      if (branchId) {
        query.andWhere('order.branch_id = :branchId', { branchId });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching recent orders:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics for the last 7 days
   */
  async getRevenueAnalytics(branchId?: string, days: number = 7) {
    try {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(id) as order_count,
          SUM(total_amount) as revenue,
          AVG(total_amount) as avg_order_value
        FROM orders
        WHERE created_at BETWEEN ? AND ?
        ${branchId ? 'AND branch_id = ?' : ''}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      const params = branchId 
        ? [startDate, endDate, branchId]
        : [startDate, endDate];

      const analytics = await AppDataSource.query(query, params);

      return {
        start_date: startDate,
        end_date: endDate,
        days,
        data: analytics,
      };
    } catch (error) {
      logger.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Get order status distribution
   */
  async getOrderStatusDistribution(branchId?: string) {
    try {
      const query = this.orderRepository
        .createQueryBuilder('order')
        .select('order.order_status', 'status')
        .addSelect('COUNT(order.id)', 'count')
        .groupBy('order.order_status');

      if (branchId) {
        query.where('order.branch_id = :branchId', { branchId });
      }

      const distribution = await query.getRawMany();

      return {
        branch_id: branchId,
        distribution,
      };
    } catch (error) {
      logger.error('Error fetching order status distribution:', error);
      throw error;
    }
  }

  /**
   * Get payment method distribution
   */
  async getPaymentMethodDistribution(branchId?: string) {
    try {
      const query = `
        SELECT 
          p.payment_method,
          COUNT(p.id) as count,
          SUM(p.amount) as total_amount
        FROM payments p
        INNER JOIN orders o ON p.order_id = o.id
        WHERE p.payment_status = 'COMPLETED'
        ${branchId ? 'AND o.branch_id = ?' : ''}
        GROUP BY p.payment_method
        ORDER BY total_amount DESC
      `;

      const params = branchId ? [branchId] : [];
      const distribution = await AppDataSource.query(query, params);

      return {
        branch_id: branchId,
        distribution,
      };
    } catch (error) {
      logger.error('Error fetching payment method distribution:', error);
      throw error;
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(branchId?: string) {
    try {
      const query = this.rawMaterialRepository
        .createQueryBuilder('rm')
        .where('rm.current_stock <= rm.minimum_stock');

      if (branchId) {
        query.andWhere('rm.branch_id = :branchId', { branchId });
      }

      const lowStockItems = await query.getMany();

      return {
        branch_id: branchId,
        count: lowStockItems.length,
        items: lowStockItems,
      };
    } catch (error) {
      logger.error('Error fetching low stock alerts:', error);
      throw error;
    }
  }

  /**
   * Get upcoming reservations
   */
  async getUpcomingReservations(branchId?: string, hours: number = 24) {
    try {
      const now = new Date();
      const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

      const query = this.reservationRepository
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.customer', 'customer')
        .leftJoinAndSelect('reservation.table', 'table')
        .where('reservation.reservation_date BETWEEN :now AND :futureTime', { now, futureTime })
        .andWhere('reservation.reservation_status IN (:...statuses)', { 
          statuses: ['PENDING', 'CONFIRMED'] 
        })
        .orderBy('reservation.reservation_date', 'ASC');

      if (branchId) {
        query.andWhere('reservation.branch_id = :branchId', { branchId });
      }

      const reservations = await query.getMany();

      return {
        branch_id: branchId,
        hours,
        count: reservations.length,
        reservations,
      };
    } catch (error) {
      logger.error('Error fetching upcoming reservations:', error);
      throw error;
    }
  }

  /**
   * Get top customers by spending
   */
  async getTopCustomers(branchId?: string, limit: number = 10) {
    try {
      const query = `
        SELECT 
          c.id,
          c.first_name,
          c.last_name,
          c.email,
          c.phone,
          COUNT(o.id) as order_count,
          SUM(o.total_amount) as total_spent,
          AVG(o.total_amount) as avg_order_value
        FROM customers c
        INNER JOIN orders o ON c.id = o.customer_id
        ${branchId ? 'WHERE o.branch_id = ?' : ''}
        GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone
        ORDER BY total_spent DESC
        LIMIT ?
      `;

      const params = branchId ? [branchId, limit] : [limit];
      const customers = await AppDataSource.query(query, params);

      return {
        branch_id: branchId,
        customers,
      };
    } catch (error) {
      logger.error('Error fetching top customers:', error);
      throw error;
    }
  }
}
