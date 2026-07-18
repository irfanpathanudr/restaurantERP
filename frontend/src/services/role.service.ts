import { apiService } from './api.service';
import { Role } from '@/types/entities.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class RoleService {
  private baseUrl = '/roles';

  async findAll(): Promise<Role[]> {
    const response = await apiService.get<ApiResponse<Role[]>>(this.baseUrl);
    return response.data.data;
  }

  async findById(id: string): Promise<Role> {
    const response = await apiService.get<ApiResponse<Role>>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async create(data: Partial<Role>): Promise<Role> {
    const response = await apiService.post<ApiResponse<Role>>(this.baseUrl, data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Role>): Promise<Role> {
    const response = await apiService.put<ApiResponse<Role>>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async assignPermissions(id: string, permissionIds: string[]): Promise<Role> {
    const response = await apiService.post<ApiResponse<Role>>(
      `${this.baseUrl}/${id}/permissions`,
      { permissionIds }
    );
    return response.data.data;
  }
}

export const roleService = new RoleService();
