import { Request, Response, NextFunction } from 'express';
import { MenuItemService } from '../services/menu-item.service';

export class MenuItemController {
  private menuItemService = new MenuItemService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const menuItem = await this.menuItemService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, categoryId, type, isAvailable } = req.query;
      const menuItems = await this.menuItemService.findAll({
        branchId: branchId as string,
        categoryId: categoryId as string,
        type: type as string,
        isAvailable: isAvailable === 'true',
      });
      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        data: menuItems,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const menuItem = await this.menuItemService.findById(id);
      if (!menuItem) {
        res.status(404).json({ success: false, message: 'Menu item not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Menu item retrieved successfully',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const menuItem = await this.menuItemService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Menu item updated successfully',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.menuItemService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Menu item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  toggleAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const menuItem = await this.menuItemService.toggleAvailability(id);
      res.status(200).json({
        success: true,
        message: 'Menu item availability updated successfully',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  };
}
