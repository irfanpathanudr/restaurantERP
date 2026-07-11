import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private dashboardService = new DashboardService();

  getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId } = req.query;
      const overview = await this.dashboardService.getOverview(branchId as string);
      res.status(200).json({
        success: true,
        message: 'Dashboard overview retrieved successfully',
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  };

  getRecentOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, limit } = req.query;
      const orders = await this.dashboardService.getRecentOrders(
        branchId as string,
        limit ? parseInt(limit as string) : 10
      );
      res.status(200).json({
        success: true,
        message: 'Recent orders retrieved successfully',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

  getRevenueAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, days } = req.query;
      const analytics = await this.dashboardService.getRevenueAnalytics(
        branchId as string,
        days ? parseInt(days as string) : 7
      );
      res.status(200).json({
        success: true,
        message: 'Revenue analytics retrieved successfully',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderStatusDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId } = req.query;
      const distribution = await this.dashboardService.getOrderStatusDistribution(branchId as string);
      res.status(200).json({
        success: true,
        message: 'Order status distribution retrieved successfully',
        data: distribution,
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentMethodDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId } = req.query;
      const distribution = await this.dashboardService.getPaymentMethodDistribution(branchId as string);
      res.status(200).json({
        success: true,
        message: 'Payment method distribution retrieved successfully',
        data: distribution,
      });
    } catch (error) {
      next(error);
    }
  };

  getLowStockAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId } = req.query;
      const alerts = await this.dashboardService.getLowStockAlerts(branchId as string);
      res.status(200).json({
        success: true,
        message: 'Low stock alerts retrieved successfully',
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  };

  getUpcomingReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, hours } = req.query;
      const reservations = await this.dashboardService.getUpcomingReservations(
        branchId as string,
        hours ? parseInt(hours as string) : 24
      );
      res.status(200).json({
        success: true,
        message: 'Upcoming reservations retrieved successfully',
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  };

  getTopCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, limit } = req.query;
      const customers = await this.dashboardService.getTopCustomers(
        branchId as string,
        limit ? parseInt(limit as string) : 10
      );
      res.status(200).json({
        success: true,
        message: 'Top customers retrieved successfully',
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  };
}
