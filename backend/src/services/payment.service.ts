import { AppDataSource } from '../config/database';
import { Payment } from '../database/entities/Payment.entity';
import { CreatePaymentDto, PaymentStatus } from '../dto/payment/CreatePaymentDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class PaymentService {
  private get paymentRepository(): Repository<Payment> {
    return AppDataSource.getRepository(Payment);
  }

  async create(data: CreatePaymentDto): Promise<Payment> {
    try {
      const payment = this.paymentRepository.create({
        ...data,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
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
        .orderBy('payment.createdAt', 'DESC');

      if (filters?.orderId) {
        query.andWhere('payment.orderId = :orderId', { orderId: filters.orderId });
      }

      if (filters?.status) {
        query.andWhere('payment.status = :status', { status: filters.status });
      }

      if (filters?.paymentMethod) {
        query.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
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
}
