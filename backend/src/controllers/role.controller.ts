import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';

export class RoleController {
  private roleService = new RoleService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.roleService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.roleService.findAll();

      res.status(200).json({
        success: true,
        message: 'Roles retrieved successfully',
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.roleService.findById(id);

      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Role retrieved successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.roleService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.roleService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  assignPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      const role = await this.roleService.assignPermissions(id, permissionIds);

      res.status(200).json({
        success: true,
        message: 'Permissions assigned successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };
}
