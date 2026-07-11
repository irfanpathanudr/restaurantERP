import { Request, Response, NextFunction } from 'express';
import { KOTService } from '../services/kot.service';
import { KOTStatus } from '../dto/kot/UpdateKOTDto';

export class KOTController {
  private kotService = new KOTService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const kot = await this.kotService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'KOT created successfully',
        data: kot,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId, kitchenId, status } = req.query;
      const kots = await this.kotService.findAll({
        orderId: orderId as string,
        kitchenId: kitchenId as string,
        status: status as KOTStatus,
      });
      res.status(200).json({
        success: true,
        message: 'KOTs retrieved successfully',
        data: kots,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const kot = await this.kotService.findById(id);
      if (!kot) {
        res.status(404).json({ success: false, message: 'KOT not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'KOT retrieved successfully',
        data: kot,
      });
    } catch (error) {
      next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const kot = await this.kotService.changeStatus(id, status as KOTStatus);
      res.status(200).json({
        success: true,
        message: 'KOT status updated successfully',
        data: kot,
      });
    } catch (error) {
      next(error);
    }
  };

  completeKOT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const kot = await this.kotService.completeKOT(id);
      res.status(200).json({
        success: true,
        message: 'KOT completed successfully',
        data: kot,
      });
    } catch (error) {
      next(error);
    }
  };
}
