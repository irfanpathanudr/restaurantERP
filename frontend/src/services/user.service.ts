import { apiService } from './api.service';
import { User } from '@/types/entities.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UserFilters {
  restaurantId?: string;
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  private baseUrl = '/users';

  async findAll(filters?: UserFilters): Promise<{ data: User[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.restaurantId) params.append('restaurantId', filters.restaurantId);
    if (filters?.branchId) params.append('branchId', filters.branchId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiService.get<ApiResponse<User[]>>(
      `${this.baseUrl}?${params.toString()}`
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination || {},
    };
  }

  async findById(id: string): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async create(data: Partial<User>): Promise<User> {
    const response = await apiService.post<ApiResponse<User>>(this.baseUrl, data);
    return response.data.data;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async changeStatus(id: string, status: string): Promise<User> {
    const response = await apiService.patch<ApiResponse<User>>(`${this.baseUrl}/${id}/status`, {
      status,
    });
    return response.data.data;
  }
}

export const userService = new UserService();
