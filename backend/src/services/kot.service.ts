import AppDataSource from '../config/database';
import { KOT } from '../database/entities/KOT.entity';
import { CreateKOTDto } from '../dto/kot/CreateKOTDto';
import { KOTStatus } from '../dto/kot/UpdateKOTDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class KOTService {
  private get kotRepository(): Repository<KOT> {
    return AppDataSource.getRepository(KOT);
  }

  async create(data: CreateKOTDto): Promise<KOT> {
    try {
      // Generate KOT number
      const kotNumber = `KOT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const kot = this.kotRepository.create({
        ...data,
        kotNumber,
        status: KOTStatus.PENDING,
        items: JSON.stringify(data.items),
      });

      await this.kotRepository.save(kot);
      logger.info(`KOT created: ${kot.id}`);
      return kot;
    } catch (error) {
      logger.error('Error creating KOT:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    orderId?: string;
    kitchenId?: string;
    status?: KOTStatus;
  }): Promise<KOT[]> {
    try {
      const query = this.kotRepository.createQueryBuilder('kot')
        .leftJoinAndSelect('kot.order', 'order')
        .leftJoinAndSelect('kot.kitchen', 'kitchen')
        .orderBy('kot.createdAt', 'DESC');

      if (filters?.orderId) {
        query.andWhere('kot.orderId = :orderId', { orderId: filters.orderId });
      }

      if (filters?.kitchenId) {
        query.andWhere('kot.kitchenId = :kitchenId', { kitchenId: filters.kitchenId });
      }

      if (filters?.status) {
        query.andWhere('kot.status = :status', { status: filters.status });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching KOTs:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<KOT | null> {
    try {
      return await this.kotRepository.findOne({
        where: { id },
        relations: ['order', 'kitchen'],
      });
    } catch (error) {
      logger.error(`Error fetching KOT ${id}:`, error);
      throw error;
    }
  }

  async changeStatus(id: string, status: KOTStatus): Promise<KOT> {
    try {
      const kot = await this.kotRepository.findOne({ where: { id } });
      if (!kot) throw new Error('KOT not found');

      kot.status = status;
      
      if (status === KOTStatus.PREPARING && !kot.preparedAt) {
        kot.preparedAt = new Date();
      } else if (status === KOTStatus.READY && !kot.readyAt) {
        kot.readyAt = new Date();
      } else if (status === KOTStatus.SERVED && !kot.servedAt) {
        kot.servedAt = new Date();
      }

      await this.kotRepository.save(kot);
      logger.info(`KOT status changed: ${id} -> ${status}`);
      return kot;
    } catch (error) {
      logger.error(`Error changing KOT status ${id}:`, error);
      throw error;
    }
  }

  async completeKOT(id: string): Promise<KOT> {
    try {
      return await this.changeStatus(id, KOTStatus.SERVED);
    } catch (error) {
      logger.error(`Error completing KOT ${id}:`, error);
      throw error;
    }
  }
}
