import { Request, Response, NextFunction } from 'express';
import { SettingService } from '../services/setting.service';
import { SettingCategory } from '../database/entities/Setting.entity';

export class SettingController {
  private settingService = new SettingService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const setting = await this.settingService.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Setting created successfully',
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, branchId, publicOnly } = req.query;
      const settings = await this.settingService.findAll(
        category as SettingCategory,
        branchId as string,
        publicOnly === 'true'
      );
      res.status(200).json({
        success: true,
        message: 'Settings retrieved successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const setting = await this.settingService.findById(id);
      if (!setting) {
        res.status(404).json({ success: false, message: 'Setting not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Setting retrieved successfully',
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  };

  findByKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const { branchId } = req.query;
      const setting = await this.settingService.findByKey(key, branchId as string);
      if (!setting) {
        res.status(404).json({ success: false, message: 'Setting not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Setting retrieved successfully',
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  };

  getValue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const { branchId } = req.query;
      const value = await this.settingService.getValue(key, branchId as string);
      if (value === null) {
        res.status(404).json({ success: false, message: 'Setting not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Setting value retrieved successfully',
        data: { key, value },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const setting = await this.settingService.update(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Setting updated successfully',
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  };

  updateByKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const { value, branchId } = req.body;
      const userId = (req as any).user?.id;
      const setting = await this.settingService.updateByKey(key, value, branchId, userId);
      res.status(200).json({
        success: true,
        message: 'Setting updated successfully',
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      await this.settingService.delete(id, userId);
      res.status(200).json({
        success: true,
        message: 'Setting deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  findByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;
      const { branchId } = req.query;
      const settings = await this.settingService.findByCategory(category as SettingCategory, branchId as string);
      res.status(200).json({
        success: true,
        message: 'Settings retrieved successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  bulkUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { settings, branchId } = req.body;
      const userId = (req as any).user?.id;
      const updatedSettings = await this.settingService.bulkUpdate(settings, branchId, userId);
      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings,
      });
    } catch (error) {
      next(error);
    }
  };

  initializeDefaults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.settingService.initializeDefaults();
      res.status(200).json({
        success: true,
        message: 'Default settings initialized successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
