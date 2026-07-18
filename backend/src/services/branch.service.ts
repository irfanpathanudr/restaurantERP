import AppDataSource from '../config/database';
import { Branch } from '../database/entities/Branch.entity';
import { CreateBranchDto } from '../dto/branch/CreateBranchDto';
import { UpdateBranchDto } from '../dto/branch/UpdateBranchDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class BranchService {
  private get branchRepository(): Repository<Branch> {
    return AppDataSource.getRepository(Branch);
  }

  async create(data: CreateBranchDto): Promise<Branch> {
    try {
      const branch = this.branchRepository.create(data);
      await this.branchRepository.save(branch);

      logger.info(`Branch created: ${branch.id}`);
      return branch;
    } catch (error) {
      logger.error('Error creating branch:', error);
      throw error;
    }
  }

  async findAll(restaurantId?: string): Promise<Branch[]> {
    try {
      const queryBuilder = this.branchRepository.createQueryBuilder('branch')
        .leftJoinAndSelect('branch.restaurant', 'restaurant')
        .orderBy('branch.created_at', 'DESC');

      if (restaurantId) {
        queryBuilder.where('branch.restaurant_id = :restaurantId', { restaurantId });
      }

      const branches = await queryBuilder.getMany();
      return branches;
    } catch (error) {
      logger.error('Error fetching branches:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Branch | null> {
    try {
      const branch = await this.branchRepository.findOne({
        where: { id },
        relations: ['restaurant', 'kitchens', 'tables'],
      });
      return branch;
    } catch (error) {
      logger.error(`Error fetching branch ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateBranchDto): Promise<Branch> {
    try {
      const branch = await this.branchRepository.findOne({ where: { id } });

      if (!branch) {
        throw new Error('Branch not found');
      }

      Object.assign(branch, data);
      await this.branchRepository.save(branch);

      logger.info(`Branch updated: ${branch.id}`);
      return branch;
    } catch (error) {
      logger.error(`Error updating branch ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const branch = await this.branchRepository.findOne({ where: { id } });

      if (!branch) {
        throw new Error('Branch not found');
      }

      await this.branchRepository.softRemove(branch);
      logger.info(`Branch deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting branch ${id}:`, error);
      throw error;
    }
  }
}
