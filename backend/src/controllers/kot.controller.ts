import { Request, Response, NextFunction } from 'express';
import { KOTService } from '../services/kot.service';

export class KOTController {
  private kotService = new KOTService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const waiterId = (req as any).user?.userId;
      const kot = await this.kotService.create({ ...req.body, waiterId });
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
      const { orderId, kitchenId, status, branchId, activeOnly } = req.query;
      const kots = await this.kotService.findAll({
        orderId: orderId as string,
        kitchenId: kitchenId as string,
        status: status as string,
        branchId: branchId as string,
        activeOnly: activeOnly === 'true',
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
      const kot = await this.kotService.changeStatus(id, status);
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

  printKOT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.kotService.printKOT(id);
      res.status(200).json({
        success: true,
        message: 'KOT print payload generated',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
