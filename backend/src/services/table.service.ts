import AppDataSource from '../config/database';
import { Table, TableStatus } from '../database/entities/Table.entity';
import { CreateTableDto } from '../dto/table/CreateTableDto';
import { UpdateTableDto } from '../dto/table/UpdateTableDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class TableService {
  private get tableRepository(): Repository<Table> {
    return AppDataSource.getRepository(Table);
  }

  async create(data: CreateTableDto | Record<string, any>): Promise<Table> {
    try {
      const payload = {
        name: data.name || data.tableNumber || data.table_number,
        table_number: data.table_number || data.tableNumber,
        branch_id: data.branch_id || data.branchId,
        table_type: data.table_type || data.tableType,
        capacity: data.capacity,
        table_status: data.table_status || data.status || TableStatus.AVAILABLE,
        shape: data.shape || 'square',
        dining_area: data.dining_area || data.location || null,
      };

      const table = this.tableRepository.create(payload);
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
      const query = this.tableRepository
        .createQueryBuilder('table')
        .leftJoinAndSelect('table.branch', 'branch')
        .where('table.deleted_at IS NULL')
        .orderBy('table.table_number', 'ASC');

      if (filters?.branchId) {
        query.andWhere('table.branch_id = :branchId', { branchId: filters.branchId });
      }

      if (filters?.status) {
        query.andWhere('table.table_status = :status', { status: filters.status });
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
        relations: ['branch'],
      });
    } catch (error) {
      logger.error(`Error fetching table ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateTableDto | Record<string, any>): Promise<Table> {
    try {
      const table = await this.tableRepository.findOne({ where: { id } });
      if (!table) throw new Error('Table not found');

      if (data.tableNumber !== undefined) table.table_number = data.tableNumber;
      if (data.name !== undefined) table.name = data.name;
      if (data.capacity !== undefined) table.capacity = data.capacity;
      if (data.branchId !== undefined) table.branch_id = data.branchId;
      if (data.tableType !== undefined) table.table_type = data.tableType;
      if (data.shape !== undefined) table.shape = data.shape;
      if (data.status !== undefined) table.table_status = data.status as TableStatus;
      if (data.location !== undefined) table.dining_area = data.location;
      if (data.table_number !== undefined) table.table_number = data.table_number;
      if (data.branch_id !== undefined) table.branch_id = data.branch_id;
      if (data.table_status !== undefined) table.table_status = data.table_status;
      if (data.dining_area !== undefined) table.dining_area = data.dining_area;
      if (data.table_type !== undefined) table.table_type = data.table_type;
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

      table.table_status = status as TableStatus;
      await this.tableRepository.save(table);
      logger.info(`Table status changed: ${id} -> ${status}`);
      return table;
    } catch (error) {
      logger.error(`Error changing table status ${id}:`, error);
      throw error;
    }
  }
}
