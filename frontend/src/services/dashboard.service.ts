import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { DashboardQueryDto, RevenueAnalyticsQueryDto } from '@/types/dto.types';
import { ApiResponse } from '@/types/common.types';

interface DashboardOverview {
  today_revenue: number;
  today_orders: number;
  today_payments: number;
  today_expenses: number;
  today_net_income: number;
  active_orders: number;
  total_customers: number;
  today_reservations: number;
  revenue_change_percentage: number;
  orders_change_percentage: number;
  yesterday_revenue: number;
  yesterday_orders: number;
}

interface RevenueAnalytics {
  start_date: Date;
  end_date: Date;
  days: number;
  data: {
    date: string;
    order_count: number;
    revenue: number;
    avg_order_value: number;
  }[];
}

class DashboardService {
  async getOverview(params?: DashboardQueryDto): Promise<ApiResponse<DashboardOverview>> {
    const response = await apiService.get<ApiResponse<DashboardOverview>>(
      API_ENDPOINTS.DASHBOARD.OVERVIEW,
      { params }
    );
    return response.data;
  }

  async getRecentOrders(params?: any): Promise<ApiResponse<any[]>> {
    const response = await apiService.get<ApiResponse<any[]>>(
      API_ENDPOINTS.DASHBOARD.RECENT_ORDERS,
      { params }
    );
    return response.data;
  }

  async getRevenueAnalytics(params?: RevenueAnalyticsQueryDto): Promise<ApiResponse<RevenueAnalytics>> {
    const response = await apiService.get<ApiResponse<RevenueAnalytics>>(
      API_ENDPOINTS.DASHBOARD.REVENUE_ANALYTICS,
      { params }
    );
    return response.data;
  }

  async getOrderStatusDistribution(params?: DashboardQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.DASHBOARD.ORDER_STATUS_DISTRIBUTION,
      { params }
    );
    return response.data;
  }

  async getPaymentMethodDistribution(params?: DashboardQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.DASHBOARD.PAYMENT_METHOD_DISTRIBUTION,
      { params }
    );
    return response.data;
  }

  async getLowStockAlerts(params?: DashboardQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.DASHBOARD.LOW_STOCK_ALERTS,
      { params }
    );
    return response.data;
  }

  async getUpcomingReservations(params?: any): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.DASHBOARD.UPCOMING_RESERVATIONS,
      { params }
    );
    return response.data;
  }

  async getTopCustomers(params?: any): Promise<ApiResponse<any[]>> {
    const response = await apiService.get<ApiResponse<any[]>>(
      API_ENDPOINTS.DASHBOARD.TOP_CUSTOMERS,
      { params }
    );
    return response.data;
  }
}

export const dashboardService = new DashboardService();
