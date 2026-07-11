import AppDataSource from '../config/database';
import { AuditLog, AuditAction } from '../database/entities/AuditLog.entity';
import { CreateAuditLogDto } from '../dto/audit-log/CreateAuditLogDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class AuditLogService {
  private get auditLogRepository(): Repository<AuditLog> {
    return AppDataSource.getRepository(AuditLog);
  }

  async create(data: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create(data);
      await this.auditLogRepository.save(auditLog);
      logger.info(`Audit log created: ${auditLog.id}`);
      return auditLog;
    } catch (error) {
      logger.error('Error creating audit log:', error);
      throw error;
    }
  }

  async log(
    action: AuditAction,
    entityType: string,
    entityId: string | null,
    userId?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
    description?: string
  ): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        user_id: userId || null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues || null,
        new_values: newValues || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        description: description || null,
      });
      await this.auditLogRepository.save(auditLog);
      logger.info(`Audit log created: ${action} on ${entityType} ${entityId || ''}`);
      return auditLog;
    } catch (error) {
      logger.error('Error logging audit:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    try {
      const query = this.auditLogRepository
        .createQueryBuilder('audit_log')
        .leftJoinAndSelect('audit_log.user', 'user')
        .orderBy('audit_log.created_at', 'DESC');

      if (filters?.userId) {
        query.andWhere('audit_log.user_id = :userId', { userId: filters.userId });
      }

      if (filters?.action) {
        query.andWhere('audit_log.action = :action', { action: filters.action });
      }

      if (filters?.entityType) {
        query.andWhere('audit_log.entity_type = :entityType', { entityType: filters.entityType });
      }

      if (filters?.entityId) {
        query.andWhere('audit_log.entity_id = :entityId', { entityId: filters.entityId });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('audit_log.created_at BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }

      const total = await query.getCount();

      if (filters?.limit) {
        query.take(filters.limit);
      }

      if (filters?.offset) {
        query.skip(filters.offset);
      }

      const data = await query.getMany();

      return { data, total };
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<AuditLog | null> {
    try {
      return await this.auditLogRepository.findOne({
        where: { id },
        relations: ['user'],
      });
    } catch (error) {
      logger.error(`Error fetching audit log ${id}:`, error);
      throw error;
    }
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    try {
      return await this.auditLogRepository.find({
        where: { entity_type: entityType, entity_id: entityId },
        relations: ['user'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      logger.error(`Error fetching audit logs for ${entityType} ${entityId}:`, error);
      throw error;
    }
  }

  async findByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    try {
      return await this.auditLogRepository.find({
        where: { user_id: userId },
        relations: ['user'],
        order: { created_at: 'DESC' },
        take: limit,
      });
    } catch (error) {
      logger.error(`Error fetching audit logs for user ${userId}:`, error);
      throw error;
    }
  }

  async getActionSummary(startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      const query = this.auditLogRepository
        .createQueryBuilder('audit_log')
        .select('audit_log.action', 'action')
        .addSelect('COUNT(audit_log.id)', 'count')
        .groupBy('audit_log.action')
        .orderBy('count', 'DESC');

      if (startDate && endDate) {
        query.where('audit_log.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }

      return await query.getRawMany();
    } catch (error) {
      logger.error('Error fetching action summary:', error);
      throw error;
    }
  }

  async getUserActivitySummary(startDate?: Date, endDate?: Date, limit: number = 10): Promise<any[]> {
    try {
      const query = this.auditLogRepository
        .createQueryBuilder('audit_log')
        .leftJoin('audit_log.user', 'user')
        .select('audit_log.user_id', 'user_id')
        .addSelect('user.first_name', 'first_name')
        .addSelect('user.last_name', 'last_name')
        .addSelect('user.email', 'email')
        .addSelect('COUNT(audit_log.id)', 'action_count')
        .where('audit_log.user_id IS NOT NULL')
        .groupBy('audit_log.user_id')
        .addGroupBy('user.first_name')
        .addGroupBy('user.last_name')
        .addGroupBy('user.email')
        .orderBy('action_count', 'DESC')
        .limit(limit);

      if (startDate && endDate) {
        query.andWhere('audit_log.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }

      return await query.getRawMany();
    } catch (error) {
      logger.error('Error fetching user activity summary:', error);
      throw error;
    }
  }

  async deleteOldLogs(daysToKeep: number = 2555): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.auditLogRepository
        .createQueryBuilder()
        .delete()
        .where('created_at < :cutoffDate', { cutoffDate })
        .execute();

      logger.info(`Deleted ${result.affected || 0} old audit logs`);
      return result.affected || 0;
    } catch (error) {
      logger.error('Error deleting old audit logs:', error);
      throw error;
    }
  }
}
