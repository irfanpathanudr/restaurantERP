import AppDataSource from '../config/database';
import { Payment } from '../database/entities/Payment.entity';
import { Order, PaymentStatus as OrderPaymentStatus } from '../database/entities/Order.entity';
import { CreatePaymentDto, PaymentStatus } from '../dto/payment/CreatePaymentDto';
import { SplitPaymentDto } from '../dto/payment/SplitPaymentDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class PaymentService {
  private get paymentRepository(): Repository<Payment> {
    return AppDataSource.getRepository(Payment);
  }
  private get orderRepository(): Repository<Order> {
    return AppDataSource.getRepository(Order);
  }

  async create(data: CreatePaymentDto): Promise<Payment> {
    try {
      const payment = this.paymentRepository.create({
        payment_number: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        order_id: data.orderId,
        payment_method: data.paymentMethod as any,
        amount: data.amount,
        transaction_id: data.transactionId || null,
        payment_status: 'success',
        payment_date: new Date(),
        notes: data.notes || null,
      });
      await this.paymentRepository.save(payment);
      logger.info(`Payment created: ${payment.id}`);
      return payment;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    orderId?: string;
    status?: string;
    paymentMethod?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Payment[]> {
    try {
      const query = this.paymentRepository.createQueryBuilder('payment')
        .leftJoinAndSelect('payment.order', 'order')
        .orderBy('payment.created_at', 'DESC');

      if (filters?.orderId) {
        query.andWhere('payment.order_id = :orderId', { orderId: filters.orderId });
      }

      if (filters?.status) {
        query.andWhere('payment.payment_status = :status', { status: filters.status });
      }

      if (filters?.paymentMethod) {
        query.andWhere('payment.payment_method = :paymentMethod', { paymentMethod: filters.paymentMethod });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('payment.created_at BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching payments:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Payment | null> {
    try {
      return await this.paymentRepository.findOne({
        where: { id },
        relations: ['order'],
      });
    } catch (error) {
      logger.error(`Error fetching payment ${id}:`, error);
      throw error;
    }
  }

  async refund(id: string, reason: string): Promise<Payment> {
    try {
      const payment = await this.paymentRepository.findOne({ where: { id } });
      if (!payment) throw new Error('Payment not found');

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error('Only completed payments can be refunded');
      }

      payment.status = PaymentStatus.REFUNDED;
      payment.notes = `Refunded: ${reason}`;
      await this.paymentRepository.save(payment);

      logger.info(`Payment refunded: ${id}`);
      return payment;
    } catch (error) {
      logger.error(`Error refunding payment ${id}:`, error);
      throw error;
    }
  }

  async processSplitPayment(data: SplitPaymentDto): Promise<{ payments: Payment[]; order: Order }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get order
      const order = await queryRunner.manager.findOne(Order, { 
        where: { id: data.orderId },
        relations: ['order_items']
      });
      if (!order) throw new Error('Order not found');

      if (order.is_locked) {
        throw new Error('Cannot process payment for a locked order');
      }

      // Calculate total payment amount
      const totalPaymentAmount = data.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const remainingAmount = Number(order.grand_total) - Number(order.paid_amount);

      if (totalPaymentAmount > remainingAmount) {
        throw new Error(`Payment amount (${totalPaymentAmount}) exceeds remaining amount (${remainingAmount})`);
      }

      // Create payment records
      const payments: Payment[] = [];
      const existingPaymentCount = await queryRunner.manager.count(Payment, {
        where: { order_id: data.orderId }
      });

      for (let i = 0; i < data.payments.length; i++) {
        const paymentData = data.payments[i];
        const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const payment = queryRunner.manager.create(Payment, {
          payment_number: paymentNumber,
          order_id: data.orderId,
          payment_method: paymentData.paymentMethod as any,
          payment_mode: paymentData.paymentMode as any,
          payment_gateway: null,
          amount: paymentData.amount,
          transaction_id: paymentData.transactionId || null,
          reference_number: paymentData.referenceNumber || null,
          payment_status: 'success',
          payment_date: new Date(),
          notes: paymentData.notes || data.notes || null,
          is_split_payment: data.payments.length > 1,
          payment_sequence: existingPaymentCount + i + 1,
        });

        await queryRunner.manager.save(payment);
        payments.push(payment);
      }

      // Update order payment status
      const newPaidAmount = Number(order.paid_amount) + totalPaymentAmount;
      order.paid_amount = Number(newPaidAmount.toFixed(2));
      order.due_amount = Number((Number(order.grand_total) - newPaidAmount).toFixed(2));

      if (order.due_amount <= 0.01) {
        order.payment_status = OrderPaymentStatus.PAID;
        order.due_amount = 0;
      } else if (newPaidAmount > 0) {
        order.payment_status = OrderPaymentStatus.PARTIAL;
      }

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      logger.info(`Split payment processed for order ${data.orderId}: ${payments.length} payments, total ${totalPaymentAmount}`);
      
      const updatedOrder = await this.orderRepository.findOne({
        where: { id: data.orderId },
        relations: ['branch', 'table', 'customer', 'order_items', 'order_items.menu_item'],
      });

      return { payments, order: updatedOrder! };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error processing split payment for order ${data.orderId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getOrderPayments(orderId: string): Promise<Payment[]> {
    try {
      return await this.paymentRepository.find({
        where: { order_id: orderId },
        order: { payment_sequence: 'ASC' }
      });
    } catch (error) {
      logger.error(`Error fetching payments for order ${orderId}:`, error);
      throw error;
    }
  }
}
