import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '../dto/order/CreateOrderDto';

export class OrderController {
  private orderService = new OrderService();

  private sanitizeOrderForRole(order: any, userRole?: string): any {
    // List of roles that should not see payment information
    const restrictedRoles = ['waiter', 'kitchen_staff', 'chef'];
    
    if (userRole && restrictedRoles.includes(userRole.toLowerCase())) {
      // Remove payment-sensitive fields
      const sanitized = { ...order };
      delete sanitized.payment_status;
      delete sanitized.subtotal;
      delete sanitized.discount_amount;
      delete sanitized.discount_percentage;
      delete sanitized.discount_type;
      delete sanitized.discount_reason;
      delete sanitized.coupon_code;
      delete sanitized.tax_amount;
      delete sanitized.tax_percentage;
      delete sanitized.service_charge;
      delete sanitized.delivery_charge;
      delete sanitized.tips;
      delete sanitized.rounding_amount;
      delete sanitized.grand_total;
      delete sanitized.paid_amount;
      delete sanitized.due_amount;
      delete sanitized.cashier_id;
      delete sanitized.cashier_confirmed_at;
      return sanitized;
    }
    
    return order;
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const waiterId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.create({ ...req.body, waiterId });
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: this.sanitizeOrderForRole(order, userRole),
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, status, orderType, customerId, tableId, startDate, endDate, activeOnly } =
        req.query;
      const userRole = (req as any).user?.role;
      const orders = await this.orderService.findAll({
        branchId: branchId as string,
        status: status as string,
        orderType: orderType as string,
        customerId: customerId as string,
        tableId: tableId as string,
        activeOnly: activeOnly === 'true',
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders.map(order => this.sanitizeOrderForRole(order, userRole)),
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.findById(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: this.sanitizeOrderForRole(order, userRole),
      });
    } catch (error) {
      next(error);
    }
  };

  findActiveByTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tableId } = req.params;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.findActiveByTable(tableId);
      res.status(200).json({
        success: true,
        message: order ? 'Active order retrieved' : 'No active order for table',
        data: order ? this.sanitizeOrderForRole(order, userRole) : null,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: this.sanitizeOrderForRole(order, userRole),
      });
    } catch (error) {
      next(error);
    }
  };

  addItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const waiterId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const result = await this.orderService.addItems(id, { ...req.body, waiterId });
      res.status(200).json({
        success: true,
        message: 'Items added successfully',
        data: {
          order: this.sanitizeOrderForRole(result.order, userRole),
          kot: result.kot,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, itemId } = req.params;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.removeItem(id, itemId);
      res.status(200).json({
        success: true,
        message: 'Item removed successfully',
        data: this.sanitizeOrderForRole(order, userRole),
      });
    } catch (error) {
      next(error);
    }
  };

  updateItemQuantity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, itemId } = req.params;
      const { quantity } = req.body;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.updateItemQuantity(id, itemId, Number(quantity));
      res.status(200).json({
        success: true,
        message: 'Item quantity updated',
        data: this.sanitizeOrderForRole(order, userRole),
      });
    } catch (error) {
      next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.changeStatus(id, status as OrderStatus);
      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: this.sanitizeOrderForRole(order, userRole),
      });
    } catch (error) {
      next(error);
    }
  };

  completeOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.completeOrder(id);
      res.status(200).json({
        success: true,
        message: 'Order completed successfully',
        data: this.sanitizeOrderForRole(order, userRole),
      });
    } catch (error) {
      next(error);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.cancelOrder(id);
      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: this.sanitizeOrderForRole(order, userRole),
      });
    } catch (error) {
      next(error);
    }
  };

  applyDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.applyDiscount(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Discount applied successfully',
        data: this.sanitizeOrderForRole(order, userRole),
      });
    } catch (error) {
      next(error);
    }
  };

  confirmByCashier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const cashierId = (req as any).user?.userId || req.body.cashierId;
      if (!cashierId) {
        res.status(400).json({ success: false, message: 'Cashier ID is required' });
        return;
      }
      const order = await this.orderService.confirmOrderByCashier(id, cashierId);
      res.status(200).json({
        success: true,
        message: 'Order confirmed and locked by cashier',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };
}
