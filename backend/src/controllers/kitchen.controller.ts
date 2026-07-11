import { Request, Response, NextFunction } from 'express';
import { KitchenService } from '../services/kitchen.service';

export class KitchenController {
  private kitchenService = new KitchenService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const kitchen = await this.kitchenService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Kitchen created successfully',
        data: kitchen,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, search } = req.query;
      const kitchens = await this.kitchenService.findAll({
        branchId: branchId as string,
        search: search as string,
      });
      res.status(200).json({
        success: true,
        message: 'Kitchens retrieved successfully',
        data: kitchens,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const kitchen = await this.kitchenService.findById(id);
      if (!kitchen) {
        res.status(404).json({ success: false, message: 'Kitchen not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Kitchen retrieved successfully',
        data: kitchen,
      });
    } catch (error) {
      next(error);
    }
  };

  findByCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, code } = req.params;
      const kitchen = await this.kitchenService.findByCode(branchId, code);
      if (!kitchen) {
        res.status(404).json({ success: false, message: 'Kitchen not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Kitchen retrieved successfully',
        data: kitchen,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const kitchen = await this.kitchenService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Kitchen updated successfully',
        data: kitchen,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.kitchenService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Kitchen deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateSortOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { sort_order } = req.body;
      const kitchen = await this.kitchenService.updateSortOrder(id, sort_order);
      res.status(200).json({
        success: true,
        message: 'Kitchen sort order updated successfully',
        data: kitchen,
      });
    } catch (error) {
      next(error);
    }
  };
}
