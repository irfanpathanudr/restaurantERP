import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
  private paymentService = new PaymentService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payment = await this.paymentService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Payment processed successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId, status, paymentMethod, startDate, endDate } = req.query;
      const payments = await this.paymentService.findAll({
        orderId: orderId as string,
        status: status as string,
        paymentMethod: paymentMethod as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Payments retrieved successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.findById(id);
      if (!payment) {
        res.status(404).json({ success: false, message: 'Payment not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Payment retrieved successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

  refund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const payment = await this.paymentService.refund(id, reason);
      res.status(200).json({
        success: true,
        message: 'Payment refunded successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

  processSplitPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.paymentService.processSplitPayment(req.body);
      res.status(201).json({
        success: true,
        message: 'Split payment processed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId } = req.params;
      const payments = await this.paymentService.getOrderPayments(orderId);
      res.status(200).json({
        success: true,
        message: 'Order payments retrieved successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  };
}
