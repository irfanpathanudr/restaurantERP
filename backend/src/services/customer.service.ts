import AppDataSource from '../config/database';
import { Customer } from '../database/entities/Customer.entity';
import { CreateCustomerDto } from '../dto/customer/CreateCustomerDto';
import { UpdateCustomerDto } from '../dto/customer/UpdateCustomerDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class CustomerService {
  private get customerRepository(): Repository<Customer> {
    return AppDataSource.getRepository(Customer);
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    try {
      const customer = this.customerRepository.create(data);
      await this.customerRepository.save(customer);
      logger.info(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw error;
    }
  }

  async findAll(filters?: { type?: string; search?: string }): Promise<Customer[]> {
    try {
      const query = this.customerRepository.createQueryBuilder('customer')
        .orderBy('customer.created_at', 'DESC');

      if (filters?.type) {
        query.andWhere('customer.type = :type', { type: filters.type });
      }

      if (filters?.search) {
        query.andWhere(
          '(customer.name LIKE :search OR customer.phone LIKE :search OR customer.email LIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching customers:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Customer | null> {
    try {
      return await this.customerRepository.findOne({
        where: { id },
        relations: ['orders'],
      });
    } catch (error) {
      logger.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    try {
      const customer = await this.customerRepository.findOne({ where: { id } });
      if (!customer) throw new Error('Customer not found');

      Object.assign(customer, data);
      await this.customerRepository.save(customer);
      logger.info(`Customer updated: ${id}`);
      return customer;
    } catch (error) {
      logger.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const customer = await this.customerRepository.findOne({ where: { id } });
      if (!customer) throw new Error('Customer not found');

      await this.customerRepository.softRemove(customer);
      logger.info(`Customer deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }

  async getCustomerOrders(id: string): Promise<any> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id },
        relations: ['orders', 'orders.items', 'orders.items.menuItem'],
      });

      if (!customer) throw new Error('Customer not found');

      return {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          type: customer.type,
          loyaltyPoints: customer.loyaltyPoints,
        },
        orders: customer.orders,
        totalOrders: customer.orders.length,
        totalSpent: customer.orders.reduce((sum, order) => sum + order.totalAmount, 0),
      };
    } catch (error) {
      logger.error(`Error fetching customer orders ${id}:`, error);
      throw error;
    }
  }
}
