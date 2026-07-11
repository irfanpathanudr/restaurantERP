import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/audit-log.service';
import { AuditAction } from '../database/entities/AuditLog.entity';

export class AuditLogController {
  private auditLogService = new AuditLogService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auditLog = await this.auditLogService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Audit log created successfully',
        data: auditLog,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, action, entityType, entityId, startDate, endDate, limit, offset } = req.query;
      const result = await this.auditLogService.findAll({
        userId: userId as string,
        action: action as AuditAction,
        entityType: entityType as string,
        entityId: entityId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Audit logs retrieved successfully',
        data: result.data,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const auditLog = await this.auditLogService.findById(id);
      if (!auditLog) {
        res.status(404).json({ success: false, message: 'Audit log not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Audit log retrieved successfully',
        data: auditLog,
      });
    } catch (error) {
      next(error);
    }
  };

  findByEntity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityType, entityId } = req.params;
      const auditLogs = await this.auditLogService.findByEntity(entityType, entityId);
      res.status(200).json({
        success: true,
        message: 'Audit logs retrieved successfully',
        data: auditLogs,
      });
    } catch (error) {
      next(error);
    }
  };

  findByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      const auditLogs = await this.auditLogService.findByUser(
        userId,
        limit ? parseInt(limit as string) : 100
      );
      res.status(200).json({
        success: true,
        message: 'User audit logs retrieved successfully',
        data: auditLogs,
      });
    } catch (error) {
      next(error);
    }
  };

  getActionSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const summary = await this.auditLogService.getActionSummary(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.status(200).json({
        success: true,
        message: 'Action summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserActivitySummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, limit } = req.query;
      const summary = await this.auditLogService.getUserActivitySummary(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        limit ? parseInt(limit as string) : 10
      );
      res.status(200).json({
        success: true,
        message: 'User activity summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };
}
