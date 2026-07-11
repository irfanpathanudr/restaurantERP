import { apiService } from './api.service';
import { Permission } from '@/types/entities.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class PermissionService {
  private baseUrl = '/permissions';

  async findAll(): Promise<Permission[]> {
    const response = await apiService.get<ApiResponse<Permission[]>>(this.baseUrl);
    return response.data.data;
  }

  async findById(id: string): Promise<Permission> {
    const response = await apiService.get<ApiResponse<Permission>>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async create(data: Partial<Permission>): Promise<Permission> {
    const response = await apiService.post<ApiResponse<Permission>>(this.baseUrl, data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Permission>): Promise<Permission> {
    const response = await apiService.put<ApiResponse<Permission>>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }
}

export const permissionService = new PermissionService();
