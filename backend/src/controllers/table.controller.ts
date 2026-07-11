import { Request, Response, NextFunction } from 'express';
import { TableService } from '../services/table.service';

export class TableController {
  private tableService = new TableService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const table = await this.tableService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: table,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, status } = req.query;
      const tables = await this.tableService.findAll({
        branchId: branchId as string,
        status: status as string,
      });
      res.status(200).json({
        success: true,
        message: 'Tables retrieved successfully',
        data: tables,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const table = await this.tableService.findById(id);
      if (!table) {
        res.status(404).json({ success: false, message: 'Table not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Table retrieved successfully',
        data: table,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const table = await this.tableService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Table updated successfully',
        data: table,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.tableService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Table deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const table = await this.tableService.changeStatus(id, status);
      res.status(200).json({
        success: true,
        message: 'Table status updated successfully',
        data: table,
      });
    } catch (error) {
      next(error);
    }
  };
}
