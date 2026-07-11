import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { PurchaseOrderStatus } from '../database/entities/PurchaseOrder.entity';

export class PurchaseOrderController {
  private purchaseOrderService = new PurchaseOrderService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const purchaseOrder = await this.purchaseOrderService.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Purchase order created successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { vendorId, branchId, status, startDate, endDate } = req.query;
      const purchaseOrders = await this.purchaseOrderService.findAll({
        vendorId: vendorId as string,
        branchId: branchId as string,
        status: status as PurchaseOrderStatus,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Purchase orders retrieved successfully',
        data: purchaseOrders,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const purchaseOrder = await this.purchaseOrderService.findById(id);
      if (!purchaseOrder) {
        res.status(404).json({ success: false, message: 'Purchase order not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Purchase order retrieved successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  findByPONumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { poNumber } = req.params;
      const purchaseOrder = await this.purchaseOrderService.findByPONumber(poNumber);
      if (!purchaseOrder) {
        res.status(404).json({ success: false, message: 'Purchase order not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Purchase order retrieved successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const purchaseOrder = await this.purchaseOrderService.update(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase order updated successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      await this.purchaseOrderService.delete(id, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase order deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  submitForApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const purchaseOrder = await this.purchaseOrderService.submitForApproval(id);
      res.status(200).json({
        success: true,
        message: 'Purchase order submitted for approval',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const purchaseOrder = await this.purchaseOrderService.approve(id, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase order approved successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user?.id;
      const purchaseOrder = await this.purchaseOrderService.reject(id, userId, reason);
      res.status(200).json({
        success: true,
        message: 'Purchase order rejected successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsOrdered = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const purchaseOrder = await this.purchaseOrderService.markAsOrdered(id);
      res.status(200).json({
        success: true,
        message: 'Purchase order marked as ordered',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  receiveItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { received_items } = req.body;
      const purchaseOrder = await this.purchaseOrderService.receiveItems(id, received_items);
      res.status(200).json({
        success: true,
        message: 'Items received successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const purchaseOrder = await this.purchaseOrderService.cancel(id);
      res.status(200).json({
        success: true,
        message: 'Purchase order cancelled successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };
}
