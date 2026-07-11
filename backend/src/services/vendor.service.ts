import AppDataSource from '../config/database';
import { Vendor } from '../database/entities/Vendor.entity';
import { CreateVendorDto } from '../dto/vendor/CreateVendorDto';
import { UpdateVendorDto } from '../dto/vendor/UpdateVendorDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class VendorService {
  private get vendorRepository(): Repository<Vendor> {
    return AppDataSource.getRepository(Vendor);
  }

  async create(data: CreateVendorDto): Promise<Vendor> {
    try {
      const vendor = this.vendorRepository.create({
        ...data,
        current_balance: data.opening_balance || 0,
      });
      await this.vendorRepository.save(vendor);
      logger.info(`Vendor created: ${vendor.id}`);
      return vendor;
    } catch (error) {
      logger.error('Error creating vendor:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    search?: string;
    city?: string;
    state?: string;
    rating?: number;
  }): Promise<Vendor[]> {
    try {
      const query = this.vendorRepository.createQueryBuilder('vendor')
        .orderBy('vendor.name', 'ASC');

      if (filters?.search) {
        query.andWhere(
          '(vendor.name LIKE :search OR vendor.code LIKE :search OR vendor.company_name LIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters?.city) {
        query.andWhere('vendor.city = :city', { city: filters.city });
      }

      if (filters?.state) {
        query.andWhere('vendor.state = :state', { state: filters.state });
      }

      if (filters?.rating) {
        query.andWhere('vendor.rating = :rating', { rating: filters.rating });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching vendors:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Vendor | null> {
    try {
      return await this.vendorRepository.findOne({
        where: { id },
      });
    } catch (error) {
      logger.error(`Error fetching vendor ${id}:`, error);
      throw error;
    }
  }

  async findByCode(code: string): Promise<Vendor | null> {
    try {
      return await this.vendorRepository.findOne({
        where: { code },
      });
    } catch (error) {
      logger.error(`Error fetching vendor with code ${code}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateVendorDto): Promise<Vendor> {
    try {
      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      Object.assign(vendor, data);
      await this.vendorRepository.save(vendor);
      logger.info(`Vendor updated: ${id}`);
      return vendor;
    } catch (error) {
      logger.error(`Error updating vendor ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      await this.vendorRepository.softRemove(vendor);
      logger.info(`Vendor deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting vendor ${id}:`, error);
      throw error;
    }
  }

  async updateBalance(id: string, amount: number, type: 'purchase' | 'payment'): Promise<Vendor> {
    try {
      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      if (type === 'purchase') {
        vendor.current_balance += amount;
        vendor.total_purchases += amount;
      } else if (type === 'payment') {
        vendor.current_balance -= amount;
        vendor.total_payments += amount;
      }

      await this.vendorRepository.save(vendor);
      logger.info(`Vendor balance updated: ${id} -> ${vendor.current_balance}`);
      return vendor;
    } catch (error) {
      logger.error(`Error updating vendor balance ${id}:`, error);
      throw error;
    }
  }

  async updateRating(id: string, rating: number): Promise<Vendor> {
    try {
      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      vendor.rating = rating;
      await this.vendorRepository.save(vendor);
      logger.info(`Vendor rating updated: ${id} -> ${rating}`);
      return vendor;
    } catch (error) {
      logger.error(`Error updating vendor rating ${id}:`, error);
      throw error;
    }
  }

  async getVendorStatement(id: string, startDate?: Date, endDate?: Date): Promise<{
    vendor: Vendor;
    opening_balance: number;
    total_purchases: number;
    total_payments: number;
    closing_balance: number;
  }> {
    try {
      const vendor = await this.findById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      // In a complete implementation, this would query purchase and payment transactions
      // For now, return vendor current state
      return {
        vendor,
        opening_balance: vendor.opening_balance,
        total_purchases: vendor.total_purchases,
        total_payments: vendor.total_payments,
        closing_balance: vendor.current_balance,
      };
    } catch (error) {
      logger.error(`Error generating vendor statement ${id}:`, error);
      throw error;
    }
  }

  async getTopVendors(limit: number = 10): Promise<Vendor[]> {
    try {
      return await this.vendorRepository.find({
        order: {
          total_purchases: 'DESC',
        },
        take: limit,
      });
    } catch (error) {
      logger.error('Error fetching top vendors:', error);
      throw error;
    }
  }

  async getVendorsWithOutstanding(): Promise<Vendor[]> {
    try {
      return await this.vendorRepository
        .createQueryBuilder('vendor')
        .where('vendor.current_balance > 0')
        .orderBy('vendor.current_balance', 'DESC')
        .getMany();
    } catch (error) {
      logger.error('Error fetching vendors with outstanding:', error);
      throw error;
    }
  }
}
