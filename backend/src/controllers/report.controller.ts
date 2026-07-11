import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  private reportService = new ReportService();

  getSalesReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, branchId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
        return;
      }

      const report = await this.reportService.getSalesReport(
        new Date(startDate as string),
        new Date(endDate as string),
        branchId as string
      );

      res.status(200).json({
        success: true,
        message: 'Sales report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, branchId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
        return;
      }

      const report = await this.reportService.getPaymentReport(
        new Date(startDate as string),
        new Date(endDate as string),
        branchId as string
      );

      res.status(200).json({
        success: true,
        message: 'Payment report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getExpenseReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, branchId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
        return;
      }

      const report = await this.reportService.getExpenseReport(
        new Date(startDate as string),
        new Date(endDate as string),
        branchId as string
      );

      res.status(200).json({
        success: true,
        message: 'Expense report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfitLossReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, branchId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
        return;
      }

      const report = await this.reportService.getProfitLossReport(
        new Date(startDate as string),
        new Date(endDate as string),
        branchId as string
      );

      res.status(200).json({
        success: true,
        message: 'Profit/Loss report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getTopSellingItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, branchId, limit } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
        return;
      }

      const report = await this.reportService.getTopSellingItems(
        new Date(startDate as string),
        new Date(endDate as string),
        branchId as string,
        limit ? parseInt(limit as string) : 10
      );

      res.status(200).json({
        success: true,
        message: 'Top selling items report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployeePerformanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, branchId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
        return;
      }

      const report = await this.reportService.getEmployeePerformanceReport(
        new Date(startDate as string),
        new Date(endDate as string),
        branchId as string
      );

      res.status(200).json({
        success: true,
        message: 'Employee performance report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getVendorPerformanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
        return;
      }

      const report = await this.reportService.getVendorPerformanceReport(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(200).json({
        success: true,
        message: 'Vendor performance report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getDailySalesSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, branchId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
        return;
      }

      const report = await this.reportService.getDailySalesSummary(
        new Date(startDate as string),
        new Date(endDate as string),
        branchId as string
      );

      res.status(200).json({
        success: true,
        message: 'Daily sales summary generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };
}
