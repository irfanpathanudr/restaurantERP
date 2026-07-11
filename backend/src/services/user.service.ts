import AppDataSource from '../config/database';
import { User } from '../database/entities/User.entity';
import { CreateUserDto } from '../dto/user/CreateUserDto';
import { UpdateUserDto } from '../dto/user/UpdateUserDto';
import { hashPassword } from '../utils/password.util';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class UserService {
  private get userRepository(): Repository<User> {
    return AppDataSource.getRepository(User);
  }

  async create(data: CreateUserDto): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const user = this.userRepository.create({
        ...data,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      logger.info(`User created: ${user.id}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    restaurantId?: string;
    branchId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const query = this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.restaurant', 'restaurant')
        .leftJoinAndSelect('user.branch', 'branch')
        .select([
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.email',
          'user.phone',
          'user.status',
          'user.isEmailVerified',
          'user.lastLoginAt',
          'user.createdAt',
          'user.updatedAt',
          'role.id',
          'role.name',
          'restaurant.id',
          'restaurant.name',
          'branch.id',
          'branch.name',
        ]);

      if (filters?.restaurantId) {
        query.andWhere('user.restaurantId = :restaurantId', { restaurantId: filters.restaurantId });
      }

      if (filters?.branchId) {
        query.andWhere('user.branchId = :branchId', { branchId: filters.branchId });
      }

      if (filters?.status) {
        query.andWhere('user.status = :status', { status: filters.status });
      }

      const [data, total] = await query
        .skip(skip)
        .take(limit)
        .orderBy('user.createdAt', 'DESC')
        .getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['role', 'restaurant', 'branch'],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          role: {
            id: true,
            name: true,
          },
          restaurant: {
            id: true,
            name: true,
          },
          branch: {
            id: true,
            name: true,
          },
        },
      });

      return user;
    } catch (error) {
      logger.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if email is being updated and if it already exists
      if (data.email && data.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: data.email },
        });

        if (existingUser) {
          throw new Error('Email already exists');
        }
      }

      // Update user
      Object.assign(user, data);
      await this.userRepository.save(user);

      logger.info(`User updated: ${user.id}`);
      return user;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new Error('User not found');
      }

      await this.userRepository.softRemove(user);
      logger.info(`User deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  async changeStatus(id: string, status: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new Error('User not found');
      }

      user.status = status;
      await this.userRepository.save(user);

      logger.info(`User status changed: ${id} -> ${status}`);
      return user;
    } catch (error) {
      logger.error(`Error changing user status ${id}:`, error);
      throw error;
    }
  }
}
