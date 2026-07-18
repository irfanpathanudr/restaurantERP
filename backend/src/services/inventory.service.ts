import AppDataSource from '../config/database';
import { RawMaterial } from '../database/entities/RawMaterial.entity';
import { CreateRawMaterialDto } from '../dto/inventory/CreateRawMaterialDto';
import { UpdateRawMaterialDto } from '../dto/inventory/UpdateRawMaterialDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class InventoryService {
  private get rawMaterialRepository(): Repository<RawMaterial> {
    return AppDataSource.getRepository(RawMaterial);
  }

  async create(data: CreateRawMaterialDto): Promise<RawMaterial> {
    try {
      const item = this.rawMaterialRepository.create(data);
      await this.rawMaterialRepository.save(item);
      logger.info(`Inventory item created: ${item.id}`);
      return item;
    } catch (error) {
      logger.error('Error creating inventory item:', error);
      throw error;
    }
  }

  async findAll(filters?: { branchId?: string; category?: string }): Promise<RawMaterial[]> {
    try {
      const query = this.rawMaterialRepository
        .createQueryBuilder('material')
        .leftJoinAndSelect('material.category', 'category')
        .where('material.deleted_at IS NULL')
        .orderBy('material.name', 'ASC');

      if (filters?.category) {
        query.andWhere('material.category_id = :categoryId', { categoryId: filters.category });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching inventory items:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<RawMaterial | null> {
    try {
      return await this.rawMaterialRepository.findOne({
        where: { id },
        relations: ['category'],
      });
    } catch (error) {
      logger.error(`Error fetching inventory item ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateRawMaterialDto): Promise<RawMaterial> {
    try {
      const item = await this.rawMaterialRepository.findOne({ where: { id } });
      if (!item) throw new Error('Inventory item not found');

      Object.assign(item, data);
      await this.rawMaterialRepository.save(item);
      logger.info(`Inventory item updated: ${id}`);
      return item;
    } catch (error) {
      logger.error(`Error updating inventory item ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const item = await this.rawMaterialRepository.findOne({ where: { id } });
      if (!item) throw new Error('Inventory item not found');

      await this.rawMaterialRepository.softRemove(item);
      logger.info(`Inventory item deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting inventory item ${id}:`, error);
      throw error;
    }
  }

  async adjustStock(id: string, quantity: number, type: 'add' | 'subtract', reason: string): Promise<RawMaterial> {
    try {
      const item = await this.rawMaterialRepository.findOne({ where: { id } });
      if (!item) throw new Error('Inventory item not found');

      const current = Number(item.current_stock);
      if (type === 'add') {
        item.current_stock = current + quantity;
      } else {
        if (current < quantity) {
          throw new Error('Insufficient stock');
        }
        item.current_stock = current - quantity;
      }

      await this.rawMaterialRepository.save(item);
      logger.info(`Stock adjusted for ${id}: ${type} ${quantity} - ${reason}`);
      return item;
    } catch (error) {
      logger.error(`Error adjusting stock for ${id}:`, error);
      throw error;
    }
  }

  async getLowStockItems(_branchId?: string): Promise<RawMaterial[]> {
    try {
      return await this.rawMaterialRepository
        .createQueryBuilder('material')
        .leftJoinAndSelect('material.category', 'category')
        .where('material.deleted_at IS NULL')
        .andWhere('material.current_stock <= material.reorder_level')
        .orderBy('material.current_stock', 'ASC')
        .getMany();
    } catch (error) {
      logger.error('Error fetching low stock items:', error);
      throw error;
    }
  }
}
