import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service';

export class PermissionController {
  private permissionService = new PermissionService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permission = await this.permissionService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permissions = await this.permissionService.findAll();

      res.status(200).json({
        success: true,
        message: 'Permissions retrieved successfully',
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const permission = await this.permissionService.findById(id);

      if (!permission) {
        res.status(404).json({
          success: false,
          message: 'Permission not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Permission retrieved successfully',
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const permission = await this.permissionService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Permission updated successfully',
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.permissionService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Permission deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
