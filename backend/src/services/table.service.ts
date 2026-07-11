import { AppDataSource } from '../config/database';
import { Table } from '../database/entities/Table.entity';
import { CreateTableDto } from '../dto/table/CreateTableDto';
import { UpdateTableDto } from '../dto/table/UpdateTableDto';
import logger from '../config/logger';
import QRCode from 'qrcode';
import { Repository } from 'typeorm';

export class TableService {
  private get tableRepository(): Repository<Table> {
    return AppDataSource.getRepository(Table);
  }

  async create(data: CreateTableDto): Promise<Table> {
    try {
      // Generate QR code for the table
      const qrCodeUrl = `${process.env.APP_URL}/tables/${data.branchId}/${data.tableNumber}`;
      const qrCode = await QRCode.toDataURL(qrCodeUrl);

      const table = this.tableRepository.create({
        ...data,
        qrCode,
      });
      await this.tableRepository.save(table);
      logger.info(`Table created: ${table.id}`);
      return table;
    } catch (error) {
      logger.error('Error creating table:', error);
      throw error;
    }
  }

  async findAll(filters?: { branchId?: string; status?: string }): Promise<Table[]> {
    try {
      const query = this.tableRepository.createQueryBuilder('table')
        .leftJoinAndSelect('table.branch', 'branch')
        .orderBy('table.tableNumber', 'ASC');

      if (filters?.branchId) {
        query.where('table.branchId = :branchId', { branchId: filters.branchId });
      }

      if (filters?.status) {
        query.andWhere('table.status = :status', { status: filters.status });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching tables:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Table | null> {
    try {
      return await this.tableRepository.findOne({
        where: { id },
        relations: ['branch', 'orders'],
      });
    } catch (error) {
      logger.error(`Error fetching table ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateTableDto): Promise<Table> {
    try {
      const table = await this.tableRepository.findOne({ where: { id } });
      if (!table) throw new Error('Table not found');

      Object.assign(table, data);
      await this.tableRepository.save(table);
      logger.info(`Table updated: ${id}`);
      return table;
    } catch (error) {
      logger.error(`Error updating table ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const table = await this.tableRepository.findOne({ where: { id } });
      if (!table) throw new Error('Table not found');

      await this.tableRepository.softRemove(table);
      logger.info(`Table deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting table ${id}:`, error);
      throw error;
    }
  }

  async changeStatus(id: string, status: string): Promise<Table> {
    try {
      const table = await this.tableRepository.findOne({ where: { id } });
      if (!table) throw new Error('Table not found');

      table.status = status;
      await this.tableRepository.save(table);
      logger.info(`Table status changed: ${id} -> ${status}`);
      return table;
    } catch (error) {
      logger.error(`Error changing table status ${id}:`, error);
      throw error;
    }
  }
}
