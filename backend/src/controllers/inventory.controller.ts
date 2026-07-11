import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  private inventoryService = new InventoryService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.inventoryService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Inventory item created successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, category } = req.query;
      const items = await this.inventoryService.findAll({
        branchId: branchId as string,
        category: category as string,
      });
      res.status(200).json({
        success: true,
        message: 'Inventory items retrieved successfully',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.inventoryService.findById(id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Inventory item not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Inventory item retrieved successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.inventoryService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Inventory item updated successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.inventoryService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Inventory item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity, type, reason } = req.body;
      const item = await this.inventoryService.adjustStock(id, quantity, type, reason);
      res.status(200).json({
        success: true,
        message: 'Stock adjusted successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  getLowStockItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId } = req.query;
      const items = await this.inventoryService.getLowStockItems(branchId as string);
      res.status(200).json({
        success: true,
        message: 'Low stock items retrieved successfully',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };
}
