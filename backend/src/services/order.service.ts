import AppDataSource from '../config/database';
import { Order } from '../database/entities/Order.entity';
import { OrderItem } from '../database/entities/OrderItem.entity';
import { CreateOrderDto, OrderStatus } from '../dto/order/CreateOrderDto';
import { UpdateOrderDto } from '../dto/order/UpdateOrderDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class OrderService {
  private get orderRepository(): Repository<Order> {
    return AppDataSource.getRepository(Order);
  }
  private get orderItemRepository(): Repository<OrderItem> {
    return AppDataSource.getRepository(OrderItem);
  }

  async create(data: CreateOrderDto): Promise<Order> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const taxAmount = subtotal * 0.05; // 5% tax
      const totalAmount = subtotal + taxAmount - (data.discountAmount || 0);

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const order = queryRunner.manager.create(Order, {
        ...data,
        orderNumber,
        subtotal,
        taxAmount,
        totalAmount,
        status: OrderStatus.PENDING,
      });

      await queryRunner.manager.save(order);

      // Create order items
      const orderItems = data.items.map(item =>
        queryRunner.manager.create(OrderItem, {
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          specialInstructions: item.specialInstructions,
        })
      );

      await queryRunner.manager.save(orderItems);

      await queryRunner.commitTransaction();
      logger.info(`Order created: ${order.id}`);

      return await this.findById(order.id) as Order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Error creating order:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: {
    branchId?: string;
    status?: string;
    orderType?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Order[]> {
    try {
      const query = this.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.branch', 'branch')
        .leftJoinAndSelect('order.table', 'table')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.menuItem', 'menuItem')
        .orderBy('order.createdAt', 'DESC');

      if (filters?.branchId) {
        query.andWhere('order.branchId = :branchId', { branchId: filters.branchId });
      }

      if (filters?.status) {
        query.andWhere('order.status = :status', { status: filters.status });
      }

      if (filters?.orderType) {
        query.andWhere('order.orderType = :orderType', { orderType: filters.orderType });
      }

      if (filters?.customerId) {
        query.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching orders:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Order | null> {
    try {
      return await this.orderRepository.findOne({
        where: { id },
        relations: ['branch', 'table', 'customer', 'items', 'items.menuItem', 'kots', 'payments'],
      });
    } catch (error) {
      logger.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateOrderDto): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) throw new Error('Order not found');

      Object.assign(order, data);
      await this.orderRepository.save(order);
      logger.info(`Order updated: ${id}`);
      return await this.findById(id) as Order;
    } catch (error) {
      logger.error(`Error updating order ${id}:`, error);
      throw error;
    }
  }

  async changeStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) throw new Error('Order not found');

      order.status = status;
      await this.orderRepository.save(order);
      logger.info(`Order status changed: ${id} -> ${status}`);
      return await this.findById(id) as Order;
    } catch (error) {
      logger.error(`Error changing order status ${id}:`, error);
      throw error;
    }
  }

  async completeOrder(id: string): Promise<Order> {
    try {
      return await this.changeStatus(id, OrderStatus.COMPLETED);
    } catch (error) {
      logger.error(`Error completing order ${id}:`, error);
      throw error;
    }
  }

  async cancelOrder(id: string): Promise<Order> {
    try {
      return await this.changeStatus(id, OrderStatus.CANCELLED);
    } catch (error) {
      logger.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  }
}
