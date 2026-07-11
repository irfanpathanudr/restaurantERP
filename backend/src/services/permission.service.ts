import AppDataSource from '../config/database';
import { Permission } from '../database/entities/Permission.entity';
import { CreatePermissionDto } from '../dto/permission/CreatePermissionDto';
import { UpdatePermissionDto } from '../dto/permission/UpdatePermissionDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class PermissionService {
  private get permissionRepository(): Repository<Permission> {
    return AppDataSource.getRepository(Permission);
  }

  async create(data: CreatePermissionDto): Promise<Permission> {
    try {
      // Check if permission already exists
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: data.name },
      });

      if (existingPermission) {
        throw new Error('Permission already exists');
      }

      const permission = this.permissionRepository.create(data);
      await this.permissionRepository.save(permission);

      logger.info(`Permission created: ${permission.id}`);
      return permission;
    } catch (error) {
      logger.error('Error creating permission:', error);
      throw error;
    }
  }

  async findAll(): Promise<Permission[]> {
    try {
      const permissions = await this.permissionRepository.find({
        order: { module: 'ASC', action: 'ASC' },
      });
      return permissions;
    } catch (error) {
      logger.error('Error fetching permissions:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Permission | null> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id },
      });
      return permission;
    } catch (error) {
      logger.error(`Error fetching permission ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdatePermissionDto): Promise<Permission> {
    try {
      const permission = await this.permissionRepository.findOne({ where: { id } });

      if (!permission) {
        throw new Error('Permission not found');
      }

      Object.assign(permission, data);
      await this.permissionRepository.save(permission);

      logger.info(`Permission updated: ${permission.id}`);
      return permission;
    } catch (error) {
      logger.error(`Error updating permission ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const permission = await this.permissionRepository.findOne({ where: { id } });

      if (!permission) {
        throw new Error('Permission not found');
      }

      await this.permissionRepository.softRemove(permission);
      logger.info(`Permission deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting permission ${id}:`, error);
      throw error;
    }
  }
}
