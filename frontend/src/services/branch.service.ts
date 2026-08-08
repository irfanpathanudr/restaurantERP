import { apiService } from './api.service';
import { Branch } from '@/types/entities.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class BranchService {
  private readonly BASE_PATH = '/branches';

  async findAll(restaurantId?: string): Promise<Branch[]> {
    const response = await apiService.get<ApiResponse<Branch[]>>(this.BASE_PATH, {
      params: restaurantId ? { restaurantId } : undefined,
    });
    return response.data.data || [];
  }

  async findById(id: string): Promise<Branch> {
    const response = await apiService.get<ApiResponse<Branch>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  async create(data: Partial<Branch> & Record<string, unknown>): Promise<Branch> {
    const response = await apiService.post<ApiResponse<Branch>>(this.BASE_PATH, data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Branch> & Record<string, unknown>): Promise<Branch> {
    const response = await apiService.put<ApiResponse<Branch>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}

export const branchService = new BranchService();
