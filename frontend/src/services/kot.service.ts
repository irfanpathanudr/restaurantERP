import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';

export interface KotListParams {
  kitchenId?: string;
  status?: string;
  orderId?: string;
  branchId?: string;
  activeOnly?: boolean;
}

class KotService {
  async list(params?: KotListParams) {
    const response = await apiService.get(API_ENDPOINTS.KOT.LIST, {
      params: {
        ...params,
        activeOnly: params?.activeOnly ? 'true' : undefined,
      },
    });
    return response.data.data || [];
  }

  async get(id: string) {
    const response = await apiService.get(API_ENDPOINTS.KOT.GET(id));
    return response.data.data;
  }

  async updateStatus(id: string, status: string) {
    const response = await apiService.patch(API_ENDPOINTS.KOT.UPDATE_STATUS(id), { status });
    return response.data.data;
  }

  async complete(id: string) {
    const response = await apiService.post(API_ENDPOINTS.KOT.COMPLETE(id));
    return response.data.data;
  }

  async print(id: string) {
    const response = await apiService.post(API_ENDPOINTS.KOT.PRINT(id));
    return response.data.data;
  }
}

export const kotService = new KotService();
