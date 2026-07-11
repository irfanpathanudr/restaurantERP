import AppDataSource from '../config/database';
import { Kitchen } from '../database/entities/Kitchen.entity';
import { CreateKitchenDto } from '../dto/kitchen/CreateKitchenDto';
import { UpdateKitchenDto } from '../dto/kitchen/UpdateKitchenDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class KitchenService {
  private get kitchenRepository(): Repository<Kitchen> {
    return AppDataSource.getRepository(Kitchen);
  }

  async create(data: CreateKitchenDto): Promise<Kitchen> {
    try {
      const kitchen = this.kitchenRepository.create(data);
      await this.kitchenRepository.save(kitchen);
      logger.info(`Kitchen created: ${kitchen.id}`);
      return kitchen;
    } catch (error) {
      logger.error('Error creating kitchen:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    branchId?: string;
    search?: string;
  }): Promise<Kitchen[]> {
    try {
      const query = this.kitchenRepository
        .createQueryBuilder('kitchen')
        .leftJoinAndSelect('kitchen.branch', 'branch')
        .orderBy('kitchen.sort_order', 'ASC')
        .addOrderBy('kitchen.name', 'ASC');

      if (filters?.branchId) {
        query.andWhere('kitchen.branch_id = :branchId', { branchId: filters.branchId });
      }

      if (filters?.search) {
        query.andWhere('(kitchen.name LIKE :search OR kitchen.code LIKE :search)', {
          search: `%${filters.search}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching kitchens:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Kitchen | null> {
    try {
      return await this.kitchenRepository.findOne({
        where: { id },
        relations: ['branch'],
      });
    } catch (error) {
      logger.error(`Error fetching kitchen ${id}:`, error);
      throw error;
    }
  }

  async findByCode(branchId: string, code: string): Promise<Kitchen | null> {
    try {
      return await this.kitchenRepository.findOne({
        where: { branch_id: branchId, code },
        relations: ['branch'],
      });
    } catch (error) {
      logger.error(`Error fetching kitchen with code ${code}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateKitchenDto): Promise<Kitchen> {
    try {
      const kitchen = await this.kitchenRepository.findOne({ where: { id } });
      if (!kitchen) {
        throw new Error('Kitchen not found');
      }

      Object.assign(kitchen, data);
      await this.kitchenRepository.save(kitchen);
      logger.info(`Kitchen updated: ${id}`);
      return kitchen;
    } catch (error) {
      logger.error(`Error updating kitchen ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const kitchen = await this.kitchenRepository.findOne({ where: { id } });
      if (!kitchen) {
        throw new Error('Kitchen not found');
      }

      await this.kitchenRepository.softRemove(kitchen);
      logger.info(`Kitchen deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting kitchen ${id}:`, error);
      throw error;
    }
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Kitchen> {
    try {
      const kitchen = await this.kitchenRepository.findOne({ where: { id } });
      if (!kitchen) {
        throw new Error('Kitchen not found');
      }

      kitchen.sort_order = sortOrder;
      await this.kitchenRepository.save(kitchen);
      logger.info(`Kitchen sort order updated: ${id} -> ${sortOrder}`);
      return kitchen;
    } catch (error) {
      logger.error(`Error updating kitchen sort order ${id}:`, error);
      throw error;
    }
  }
}
