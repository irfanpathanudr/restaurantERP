import AppDataSource from '../config/database';
import { Category } from '../database/entities/Category.entity';
import { CreateCategoryDto } from '../dto/category/CreateCategoryDto';
import { UpdateCategoryDto } from '../dto/category/UpdateCategoryDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class CategoryService {
  private get categoryRepository(): Repository<Category> {
    return AppDataSource.getRepository(Category);
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    try {
      const category = this.categoryRepository.create(data);
      await this.categoryRepository.save(category);
      logger.info(`Category created: ${category.id}`);
      return category;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  async findAll(branchId?: string): Promise<Category[]> {
    try {
      const query = this.categoryRepository.createQueryBuilder('category')
        .leftJoinAndSelect('category.menu_items', 'menuItems')
        .leftJoinAndSelect('category.parent_category', 'parentCategory')
        .leftJoinAndSelect('category.sub_categories', 'subCategories')
        .where('category.deleted_at IS NULL')
        .orderBy('category.sort_order', 'ASC')
        .addOrderBy('category.name', 'ASC');

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      return await this.categoryRepository.findOne({
        where: { id },
        relations: ['menu_items', 'parent_category', 'sub_categories'],
      });
    } catch (error) {
      logger.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) throw new Error('Category not found');

      Object.assign(category, data);
      await this.categoryRepository.save(category);
      logger.info(`Category updated: ${id}`);
      return category;
    } catch (error) {
      logger.error(`Error updating category ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) throw new Error('Category not found');

      await this.categoryRepository.softRemove(category);
      logger.info(`Category deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
}
