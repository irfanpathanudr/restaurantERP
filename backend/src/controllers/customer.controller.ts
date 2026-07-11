import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
  private customerService = new CustomerService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customer = await this.customerService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, search } = req.query;
      const customers = await this.customerService.findAll({
        type: type as string,
        search: search as string,
      });
      res.status(200).json({
        success: true,
        message: 'Customers retrieved successfully',
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.findById(id);
      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Customer retrieved successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.customerService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomerOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await this.customerService.getCustomerOrders(id);
      res.status(200).json({
        success: true,
        message: 'Customer orders retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
