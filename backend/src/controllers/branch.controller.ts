import { Request, Response, NextFunction } from 'express';
import { BranchService } from '../services/branch.service';

export class BranchController {
  private branchService = new BranchService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branch = await this.branchService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Branch created successfully',
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { restaurantId } = req.query;
      const branches = await this.branchService.findAll(restaurantId as string);

      res.status(200).json({
        success: true,
        message: 'Branches retrieved successfully',
        data: branches,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const branch = await this.branchService.findById(id);

      if (!branch) {
        res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Branch retrieved successfully',
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const branch = await this.branchService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Branch updated successfully',
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.branchService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Branch deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
