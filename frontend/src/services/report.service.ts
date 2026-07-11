import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { ReportQueryDto, TopSellingItemsQueryDto } from '@/types/dto.types';
import { ApiResponse } from '@/types/common.types';

class ReportService {
  async getSalesReport(params: ReportQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.REPORTS.SALES,
      { params }
    );
    return response.data;
  }

  async getPaymentReport(params: ReportQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.REPORTS.PAYMENTS,
      { params }
    );
    return response.data;
  }

  async getExpenseReport(params: ReportQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.REPORTS.EXPENSES,
      { params }
    );
    return response.data;
  }

  async getProfitLossReport(params: ReportQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.REPORTS.PROFIT_LOSS,
      { params }
    );
    return response.data;
  }

  async getTopSellingItems(params: TopSellingItemsQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.REPORTS.TOP_SELLING_ITEMS,
      { params }
    );
    return response.data;
  }

  async getEmployeePerformance(params: ReportQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.REPORTS.EMPLOYEE_PERFORMANCE,
      { params }
    );
    return response.data;
  }

  async getVendorPerformance(params: ReportQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.REPORTS.VENDOR_PERFORMANCE,
      { params }
    );
    return response.data;
  }

  async getDailySalesSummary(params: ReportQueryDto): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.REPORTS.DAILY_SALES_SUMMARY,
      { params }
    );
    return response.data;
  }
}

export const reportService = new ReportService();
