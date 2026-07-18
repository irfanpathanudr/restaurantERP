import AppDataSource from '../config/database';
import { MenuItem } from '../database/entities/MenuItem.entity';
import { CreateMenuItemDto } from '../dto/menu-item/CreateMenuItemDto';
import { UpdateMenuItemDto } from '../dto/menu-item/UpdateMenuItemDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class MenuItemService {
  private get menuItemRepository(): Repository<MenuItem> {
    return AppDataSource.getRepository(MenuItem);
  }

  async create(data: CreateMenuItemDto): Promise<MenuItem> {
    try {
      const menuItem = this.menuItemRepository.create(data);
      await this.menuItemRepository.save(menuItem);
      logger.info(`Menu item created: ${menuItem.id}`);
      return menuItem;
    } catch (error) {
      logger.error('Error creating menu item:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    branchId?: string;
    categoryId?: string;
    type?: string;
    isAvailable?: boolean;
  }): Promise<MenuItem[]> {
    try {
      const query = this.menuItemRepository.createQueryBuilder('menuItem')
        .leftJoinAndSelect('menuItem.category', 'category')
        .leftJoinAndSelect('menuItem.kitchens', 'kitchens')
        .where('menuItem.deleted_at IS NULL')
        .orderBy('menuItem.name', 'ASC');

      if (filters?.categoryId) {
        query.andWhere('menuItem.category_id = :categoryId', { categoryId: filters.categoryId });
      }

      if (filters?.type) {
        query.andWhere('menuItem.food_type = :type', { type: filters.type });
      }

      if (filters?.isAvailable !== undefined) {
        query.andWhere('menuItem.is_available = :isAvailable', { isAvailable: filters.isAvailable });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching menu items:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<MenuItem | null> {
    try {
      return await this.menuItemRepository.findOne({
        where: { id },
        relations: ['category', 'kitchens'],
      });
    } catch (error) {
      logger.error(`Error fetching menu item ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateMenuItemDto): Promise<MenuItem> {
    try {
      const menuItem = await this.menuItemRepository.findOne({ where: { id } });
      if (!menuItem) throw new Error('Menu item not found');

      Object.assign(menuItem, data);
      await this.menuItemRepository.save(menuItem);
      logger.info(`Menu item updated: ${id}`);
      return menuItem;
    } catch (error) {
      logger.error(`Error updating menu item ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const menuItem = await this.menuItemRepository.findOne({ where: { id } });
      if (!menuItem) throw new Error('Menu item not found');

      await this.menuItemRepository.softRemove(menuItem);
      logger.info(`Menu item deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting menu item ${id}:`, error);
      throw error;
    }
  }

  async toggleAvailability(id: string): Promise<MenuItem> {
    try {
      const menuItem = await this.menuItemRepository.findOne({ where: { id } });
      if (!menuItem) throw new Error('Menu item not found');

      menuItem.is_available = !menuItem.is_available;
      await this.menuItemRepository.save(menuItem);
      logger.info(`Menu item availability toggled: ${id} -> ${menuItem.is_available}`);
      return menuItem;
    } catch (error) {
      logger.error(`Error toggling menu item availability ${id}:`, error);
      throw error;
    }
  }
}
