import { AppDataSource } from '../config/database';
import { Role } from '../database/entities/Role.entity';
import { Permission } from '../database/entities/Permission.entity';
import { CreateRoleDto } from '../dto/role/CreateRoleDto';
import { UpdateRoleDto } from '../dto/role/UpdateRoleDto';
import logger from '../config/logger';
import { In, Repository } from 'typeorm';

export class RoleService {
  private get roleRepository(): Repository<Role> {
    return AppDataSource.getRepository(Role);
  }
  private get permissionRepository(): Repository<Permission> {
    return AppDataSource.getRepository(Permission);
  }

  async create(data: CreateRoleDto): Promise<Role> {
    try {
      // Check if role already exists
      const existingRole = await this.roleRepository.findOne({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new Error('Role already exists');
      }

      const role = this.roleRepository.create(data);
      await this.roleRepository.save(role);

      logger.info(`Role created: ${role.id}`);
      return role;
    } catch (error) {
      logger.error('Error creating role:', error);
      throw error;
    }
  }

  async findAll(): Promise<Role[]> {
    try {
      const roles = await this.roleRepository.find({
        relations: ['permissions'],
        order: { createdAt: 'DESC' },
      });
      return roles;
    } catch (error) {
      logger.error('Error fetching roles:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Role | null> {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['permissions'],
      });
      return role;
    } catch (error) {
      logger.error(`Error fetching role ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });

      if (!role) {
        throw new Error('Role not found');
      }

      Object.assign(role, data);
      await this.roleRepository.save(role);

      logger.info(`Role updated: ${role.id}`);
      return role;
    } catch (error) {
      logger.error(`Error updating role ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });

      if (!role) {
        throw new Error('Role not found');
      }

      await this.roleRepository.softRemove(role);
      logger.info(`Role deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    try {
      const role = await this.roleRepository.findOne({
        where: { id: roleId },
        relations: ['permissions'],
      });

      if (!role) {
        throw new Error('Role not found');
      }

      const permissions = await this.permissionRepository.find({
        where: { id: In(permissionIds) },
      });

      role.permissions = permissions;
      await this.roleRepository.save(role);

      logger.info(`Permissions assigned to role: ${roleId}`);
      return role;
    } catch (error) {
      logger.error(`Error assigning permissions to role ${roleId}:`, error);
      throw error;
    }
  }
}
