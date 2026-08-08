import { apiService } from './api.service';
import { Kitchen } from '@/types/entities.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class KitchenService {
  private readonly BASE_PATH = '/kitchens';

  async findAll(params?: { branchId?: string; search?: string }): Promise<Kitchen[]> {
    const response = await apiService.get<ApiResponse<Kitchen[]>>(this.BASE_PATH, { params });
    return response.data.data || [];
  }

  async findById(id: string): Promise<Kitchen> {
    const response = await apiService.get<ApiResponse<Kitchen>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  async create(data: Partial<Kitchen> & Record<string, unknown>): Promise<Kitchen> {
    const response = await apiService.post<ApiResponse<Kitchen>>(this.BASE_PATH, data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Kitchen> & Record<string, unknown>): Promise<Kitchen> {
    const response = await apiService.put<ApiResponse<Kitchen>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Kitchen> {
    const response = await apiService.patch<ApiResponse<Kitchen>>(
      `${this.BASE_PATH}/${id}/sort-order`,
      { sort_order: sortOrder }
    );
    return response.data.data;
  }
}

export const kitchenService = new KitchenService();
