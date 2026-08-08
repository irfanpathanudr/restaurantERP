import AppDataSource from '../config/database';
import { Order, OrderStatus, OrderType, PaymentStatus, DiscountType } from '../database/entities/Order.entity';
import { OrderItem } from '../database/entities/OrderItem.entity';
import { MenuItem } from '../database/entities/MenuItem.entity';
import { Table, TableStatus } from '../database/entities/Table.entity';
import { CreateOrderDto, OrderStatus as DtoOrderStatus } from '../dto/order/CreateOrderDto';
import { UpdateOrderDto } from '../dto/order/UpdateOrderDto';
import { AddOrderItemsDto } from '../dto/order/AddOrderItemsDto';
import { ApplyDiscountDto } from '../dto/order/ApplyDiscountDto';
import { KOTService } from './kot.service';
import logger from '../config/logger';
import { In, Not, Repository } from 'typeorm';

const TAX_RATE = 0.18; // 18% GST

const ORDER_TYPE_MAP: Record<string, OrderType> = {
  dine_in: OrderType.DINE_IN,
  takeaway: OrderType.TAKE_AWAY,
  take_away: OrderType.TAKE_AWAY,
  delivery: OrderType.DELIVERY,
};

const ACTIVE_ORDER_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.SERVED,
];

export class OrderService {
  private get orderRepository(): Repository<Order> {
    return AppDataSource.getRepository(Order);
  }
  private get orderItemRepository(): Repository<OrderItem> {
    return AppDataSource.getRepository(OrderItem);
  }
  private get menuItemRepository(): Repository<MenuItem> {
    return AppDataSource.getRepository(MenuItem);
  }
  private get tableRepository(): Repository<Table> {
    return AppDataSource.getRepository(Table);
  }
  private kotService = new KOTService();

  private mapOrderType(type: string): OrderType {
    return ORDER_TYPE_MAP[type] || OrderType.DINE_IN;
  }

  private calcTotals(items: { price: number; quantity: number }[], discountAmount = 0) {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const taxAmount = Number((subtotal * TAX_RATE).toFixed(2));
    const discount = Number(discountAmount) || 0;
    const grandTotal = Number((subtotal + taxAmount - discount).toFixed(2));
    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax_amount: taxAmount,
      tax_percentage: TAX_RATE * 100,
      discount_amount: discount,
      grand_total: grandTotal,
      due_amount: grandTotal,
    };
  }

  private async recalculateOrderTotals(orderId: string, manager = AppDataSource.manager) {
    const items = await manager.find(OrderItem, { where: { order_id: orderId } });
    const order = await manager.findOne(Order, { where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const totals = this.calcTotals(
      items.map((i) => ({ price: Number(i.price), quantity: i.quantity })),
      Number(order.discount_amount) || 0
    );

    Object.assign(order, totals);
    order.due_amount = Number(
      (Number(totals.grand_total) - Number(order.paid_amount || 0)).toFixed(2)
    );
    await manager.save(order);
    return order;
  }

  async create(data: CreateOrderDto & { waiterId?: string; kitchenId?: string; createKot?: boolean }): Promise<Order> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const menuIds = data.items.map((i) => i.menuItemId);
      const menuItems = await queryRunner.manager.find(MenuItem, { where: { id: In(menuIds) } });
      const menuById = new Map(menuItems.map((m) => [m.id, m]));

      for (const item of data.items) {
        if (!menuById.has(item.menuItemId)) {
          throw new Error(`Menu item not found: ${item.menuItemId}`);
        }
      }

      const lineItems = data.items.map((item) => {
        const menu = menuById.get(item.menuItemId)!;
        const price = item.unitPrice ?? Number(menu.price);
        return {
          menu_item_id: item.menuItemId,
          item_name: menu.name,
          price,
          quantity: item.quantity,
          total: Number((price * item.quantity).toFixed(2)),
          special_instructions: item.specialInstructions || null,
        };
      });

      const totals = this.calcTotals(
        lineItems.map((i) => ({ price: i.price, quantity: i.quantity })),
        data.discountAmount || 0
      );

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const order = queryRunner.manager.create(Order, {
        order_number: orderNumber,
        branch_id: data.branchId,
        table_id: data.tableId || null,
        customer_id: data.customerId || null,
        order_type: this.mapOrderType(data.orderType),
        order_status: OrderStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
        special_instructions: data.notes || null,
        waiter_id: data.waiterId || null,
        ordered_at: new Date(),
        paid_amount: 0,
        ...totals,
      });

      await queryRunner.manager.save(order);

      const orderItems = lineItems.map((item) =>
        queryRunner.manager.create(OrderItem, {
          ...item,
          order_id: order.id,
        })
      );
      await queryRunner.manager.save(orderItems);

      if (data.tableId) {
        await queryRunner.manager.update(Table, data.tableId, {
          table_status: TableStatus.OCCUPIED,
          current_order_id: order.id,
        });
      }

      await queryRunner.commitTransaction();

      if (data.createKot !== false && data.kitchenId) {
        try {
          await this.kotService.create({
            orderId: order.id,
            kitchenId: data.kitchenId,
            items: data.items.map((i) => ({
              menuItemId: i.menuItemId,
              quantity: i.quantity,
              specialInstructions: i.specialInstructions,
            })),
            notes: data.notes,
            waiterId: data.waiterId,
          });
        } catch (kotError) {
          logger.warn('Order created but KOT creation failed:', kotError);
        }
      }

      logger.info(`Order created: ${order.id}`);
      return (await this.findById(order.id)) as Order;
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
    tableId?: string;
    startDate?: Date;
    endDate?: Date;
    activeOnly?: boolean;
  }): Promise<Order[]> {
    try {
      const query = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.branch', 'branch')
        .leftJoinAndSelect('order.table', 'table')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.order_items', 'items')
        .leftJoinAndSelect('items.menu_item', 'menuItem')
        .where('order.deleted_at IS NULL')
        .orderBy('order.created_at', 'DESC');

      if (filters?.branchId) {
        query.andWhere('order.branch_id = :branchId', { branchId: filters.branchId });
      }

      if (filters?.status) {
        query.andWhere('order.order_status = :status', { status: filters.status });
      }

      if (filters?.orderType) {
        query.andWhere('order.order_type = :orderType', {
          orderType: this.mapOrderType(filters.orderType),
        });
      }

      if (filters?.customerId) {
        query.andWhere('order.customer_id = :customerId', { customerId: filters.customerId });
      }

      if (filters?.tableId) {
        query.andWhere('order.table_id = :tableId', { tableId: filters.tableId });
      }

      if (filters?.activeOnly) {
        query.andWhere('order.order_status IN (:...statuses)', { statuses: ACTIVE_ORDER_STATUSES });
        query.andWhere('order.payment_status != :paid', { paid: PaymentStatus.PAID });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('order.created_at BETWEEN :startDate AND :endDate', {
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
        relations: ['branch', 'table', 'customer', 'order_items', 'order_items.menu_item'],
      });
    } catch (error) {
      logger.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  }

  async findActiveByTable(tableId: string): Promise<Order | null> {
    try {
      const table = await this.tableRepository.findOne({ where: { id: tableId } });
      if (table?.current_order_id) {
        const current = await this.findById(table.current_order_id);
        if (
          current &&
          ACTIVE_ORDER_STATUSES.includes(current.order_status) &&
          current.payment_status !== PaymentStatus.PAID
        ) {
          return current;
        }
      }

      return await this.orderRepository.findOne({
        where: {
          table_id: tableId,
          order_status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELLED])),
          payment_status: Not(PaymentStatus.PAID),
        },
        relations: ['branch', 'table', 'customer', 'order_items', 'order_items.menu_item'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      logger.error(`Error fetching active order for table ${tableId}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateOrderDto): Promise<Order> {
    try {
      // Fetch order WITHOUT relations to avoid cascade issues
      const order = await this.orderRepository.findOne({ 
        where: { id }
      });
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.is_locked) {
        throw new Error('Cannot update a locked order. Order has been confirmed by cashier.');
      }

      let recalculate = false;

      // Update discount
      if (data.discountType !== undefined) {
        order.discount_type = data.discountType === 'percentage' ? DiscountType.PERCENTAGE : DiscountType.FIXED;
        recalculate = true;
      }
      
      if (data.discountValue !== undefined) {
        const discountVal = Number(data.discountValue) || 0;
        const subtotal = Number(order.subtotal) || 0;
        
        if (data.discountType === 'percentage') {
          order.discount_percentage = discountVal;
          order.discount_amount = Number(((subtotal * discountVal) / 100).toFixed(2));
        } else {
          order.discount_amount = Number(discountVal.toFixed(2));
          order.discount_percentage = 0;
        }
        recalculate = true;
      }
      
      if (data.discountReason !== undefined) {
        order.discount_reason = data.discountReason || null;
      }

      // Update tax
      if (data.taxPercentage !== undefined) {
        order.tax_percentage = Number(data.taxPercentage) || 0;
        recalculate = true;
      }

      // Update service charge
      if (data.serviceCharge !== undefined) {
        order.service_charge = Number(data.serviceCharge) || 0;
        recalculate = true;
      }

      // Recalculate totals if needed
      if (recalculate) {
        const subtotal = Number(order.subtotal) || 0;
        const discountAmount = Number(order.discount_amount) || 0;
        const afterDiscount = subtotal - discountAmount;
        const taxPercentage = Number(order.tax_percentage) || 0;
        const taxAmount = (afterDiscount * taxPercentage) / 100;
        const serviceCharge = Number(order.service_charge) || 0;
        
        order.tax_amount = Number(taxAmount.toFixed(2));
        order.grand_total = Number((afterDiscount + taxAmount + serviceCharge).toFixed(2));
        order.due_amount = Number((order.grand_total - (Number(order.paid_amount) || 0)).toFixed(2));
      }

      // Update status
      if (data.status) {
        order.order_status = data.status as unknown as OrderStatus;
      }
      
      // Update notes
      if (data.notes !== undefined) {
        order.special_instructions = data.notes || null;
      }

      // Save only the order entity without cascading to relations
      await this.orderRepository.save(order);
      logger.info(`Order updated successfully: ${id}`);
      
      // Return full order with relations
      return (await this.findById(id)) as Order;
    } catch (error: any) {
      logger.error(`Error updating order ${id}:`, {
        error: error.message,
        stack: error.stack,
        data
      });
      throw error;
    }
  }

  async addItems(
    id: string,
    data: AddOrderItemsDto & { waiterId?: string }
  ): Promise<{ order: Order; kot?: unknown }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, { where: { id } });
      if (!order) throw new Error('Order not found');

      if (order.is_locked) {
        throw new Error('Cannot add items to a locked order. Order has been confirmed by cashier.');
      }

      if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.order_status)) {
        throw new Error('Cannot add items to a closed order');
      }

      const menuIds = data.items.map((i) => i.menuItemId);
      const menuItems = await queryRunner.manager.find(MenuItem, { where: { id: In(menuIds) } });
      const menuById = new Map(menuItems.map((m) => [m.id, m]));

      const newItems = data.items.map((item) => {
        const menu = menuById.get(item.menuItemId);
        if (!menu) throw new Error(`Menu item not found: ${item.menuItemId}`);
        const price = item.unitPrice ?? Number(menu.price);
        return queryRunner.manager.create(OrderItem, {
          order_id: order.id,
          menu_item_id: item.menuItemId,
          item_name: menu.name,
          price,
          quantity: item.quantity,
          total: Number((price * item.quantity).toFixed(2)),
          special_instructions: item.specialInstructions || null,
        });
      });

      await queryRunner.manager.save(newItems);
      await this.recalculateOrderTotals(id, queryRunner.manager);

      if (order.order_status === OrderStatus.PENDING) {
        order.order_status = OrderStatus.CONFIRMED;
        await queryRunner.manager.save(order);
      }

      await queryRunner.commitTransaction();

      let kot;
      if (data.createKot !== false && data.kitchenId) {
        kot = await this.kotService.create({
          orderId: id,
          kitchenId: data.kitchenId,
          items: data.items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            specialInstructions: i.specialInstructions,
          })),
          notes: data.notes,
          waiterId: data.waiterId,
        });
      }

      logger.info(`Items added to order: ${id}`);
      return { order: (await this.findById(id)) as Order, kot };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error adding items to order ${id}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeItem(orderId: string, itemId: string): Promise<Order> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, { where: { id: orderId } });
      if (!order) throw new Error('Order not found');

      if (order.is_locked) {
        throw new Error('Cannot remove items from a locked order. Order has been confirmed by cashier.');
      }

      if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.order_status)) {
        throw new Error('Cannot remove items from a closed order');
      }

      const item = await queryRunner.manager.findOne(OrderItem, {
        where: { id: itemId, order_id: orderId },
      });
      if (!item) throw new Error('Order item not found');

      await queryRunner.manager.softRemove(item);
      await this.recalculateOrderTotals(orderId, queryRunner.manager);
      await queryRunner.commitTransaction();

      logger.info(`Item ${itemId} removed from order ${orderId}`);
      return (await this.findById(orderId)) as Order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error removing item ${itemId} from order ${orderId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateItemQuantity(
    orderId: string,
    itemId: string,
    quantity: number
  ): Promise<Order> {
    try {
      if (quantity < 1) {
        return this.removeItem(orderId, itemId);
      }

      const item = await this.orderItemRepository.findOne({
        where: { id: itemId, order_id: orderId },
      });
      if (!item) throw new Error('Order item not found');

      item.quantity = quantity;
      item.total = Number((Number(item.price) * quantity).toFixed(2));
      await this.orderItemRepository.save(item);
      await this.recalculateOrderTotals(orderId);

      return (await this.findById(orderId)) as Order;
    } catch (error) {
      logger.error(`Error updating item quantity ${itemId}:`, error);
      throw error;
    }
  }

  async changeStatus(id: string, status: DtoOrderStatus | OrderStatus | string): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) throw new Error('Order not found');

      order.order_status = status as OrderStatus;

      if (status === OrderStatus.COMPLETED || status === DtoOrderStatus.COMPLETED) {
        order.completed_at = new Date();
        if (order.table_id) {
          await this.tableRepository.update(order.table_id, {
            table_status: TableStatus.AVAILABLE,
            current_order_id: null,
          });
        }
      }

      if (status === OrderStatus.CANCELLED || status === DtoOrderStatus.CANCELLED) {
        order.cancelled_at = new Date();
        if (order.table_id) {
          await this.tableRepository.update(order.table_id, {
            table_status: TableStatus.AVAILABLE,
            current_order_id: null,
          });
        }
      }

      await this.orderRepository.save(order);
      logger.info(`Order status changed: ${id} -> ${status}`);
      return (await this.findById(id)) as Order;
    } catch (error) {
      logger.error(`Error changing order status ${id}:`, error);
      throw error;
    }
  }

  async completeOrder(id: string): Promise<Order> {
    return this.changeStatus(id, OrderStatus.COMPLETED);
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.changeStatus(id, OrderStatus.CANCELLED);
  }

  async applyDiscount(id: string, data: ApplyDiscountDto): Promise<Order> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, { where: { id } });
      if (!order) throw new Error('Order not found');

      if (order.is_locked) {
        throw new Error('Cannot apply discount to a locked order. Order has been confirmed by cashier.');
      }

      if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.order_status)) {
        throw new Error('Cannot apply discount to a closed order');
      }

      let discountAmount = 0;
      if (data.discountType === 'percentage') {
        if (data.discountValue > 100) {
          throw new Error('Discount percentage cannot exceed 100%');
        }
        discountAmount = Number((order.subtotal * (data.discountValue / 100)).toFixed(2));
        order.discount_percentage = data.discountValue;
      } else {
        if (data.discountValue > order.subtotal) {
          throw new Error('Discount amount cannot exceed subtotal');
        }
        discountAmount = data.discountValue;
        order.discount_percentage = Number(((data.discountValue / order.subtotal) * 100).toFixed(2));
      }

      order.discount_amount = discountAmount;
      order.discount_type = data.discountType as unknown as DiscountType;
      order.discount_reason = data.discountReason || null;
      order.coupon_code = data.couponCode || null;

      // Recalculate grand total
      const grandTotal = Number((
        Number(order.subtotal) +
        Number(order.tax_amount) +
        Number(order.service_charge) +
        Number(order.delivery_charge) -
        discountAmount
      ).toFixed(2));

      order.grand_total = grandTotal;
      order.due_amount = Number((grandTotal - Number(order.paid_amount || 0)).toFixed(2));

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      logger.info(`Discount applied to order ${id}: ${data.discountType} ${data.discountValue}`);
      return (await this.findById(id)) as Order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error applying discount to order ${id}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmOrderByCashier(id: string, cashierId: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) throw new Error('Order not found');

      if (order.is_locked) {
        throw new Error('Order is already confirmed and locked');
      }

      if (order.payment_status !== PaymentStatus.PAID) {
        throw new Error('Cannot confirm order. Payment is not complete.');
      }

      order.cashier_id = cashierId;
      order.cashier_confirmed_at = new Date();
      order.is_locked = true;
      order.order_status = OrderStatus.COMPLETED;
      order.completed_at = new Date();

      if (order.table_id) {
        await this.tableRepository.update(order.table_id, {
          table_status: TableStatus.AVAILABLE,
          current_order_id: null,
        });
      }

      await this.orderRepository.save(order);
      logger.info(`Order confirmed and locked by cashier ${cashierId}: ${id}`);
      return (await this.findById(id)) as Order;
    } catch (error) {
      logger.error(`Error confirming order ${id}:`, error);
      throw error;
    }
  }
}
