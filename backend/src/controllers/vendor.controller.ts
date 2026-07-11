import { Request, Response, NextFunction } from 'express';
import { VendorService } from '../services/vendor.service';

export class VendorController {
  private vendorService = new VendorService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vendor = await this.vendorService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, city, state, rating } = req.query;
      const vendors = await this.vendorService.findAll({
        search: search as string,
        city: city as string,
        state: state as string,
        rating: rating ? parseInt(rating as string) : undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Vendors retrieved successfully',
        data: vendors,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const vendor = await this.vendorService.findById(id);
      if (!vendor) {
        res.status(404).json({ success: false, message: 'Vendor not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Vendor retrieved successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  findByCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.params;
      const vendor = await this.vendorService.findByCode(code);
      if (!vendor) {
        res.status(404).json({ success: false, message: 'Vendor not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Vendor retrieved successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const vendor = await this.vendorService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Vendor updated successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.vendorService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Vendor deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      const vendor = await this.vendorService.updateRating(id, rating);
      res.status(200).json({
        success: true,
        message: 'Vendor rating updated successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  getStatement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const statement = await this.vendorService.getVendorStatement(
        id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.status(200).json({
        success: true,
        message: 'Vendor statement retrieved successfully',
        data: statement,
      });
    } catch (error) {
      next(error);
    }
  };

  getTopVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit } = req.query;
      const vendors = await this.vendorService.getTopVendors(
        limit ? parseInt(limit as string) : 10
      );
      res.status(200).json({
        success: true,
        message: 'Top vendors retrieved successfully',
        data: vendors,
      });
    } catch (error) {
      next(error);
    }
  };

  getWithOutstanding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vendors = await this.vendorService.getVendorsWithOutstanding();
      res.status(200).json({
        success: true,
        message: 'Vendors with outstanding retrieved successfully',
        data: vendors,
      });
    } catch (error) {
      next(error);
    }
  };
}
