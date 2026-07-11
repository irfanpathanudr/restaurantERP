import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { Setting } from '@/types/entities.types';
import { CreateSettingDto, UpdateSettingDto, BulkUpdateSettingsDto } from '@/types/dto.types';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';

class SettingService {
  async list(params?: any): Promise<PaginatedResponse<Setting>> {
    const response = await apiService.get<PaginatedResponse<Setting>>(
      API_ENDPOINTS.SETTINGS.LIST,
      { params }
    );
    return response.data;
  }

  async create(data: CreateSettingDto): Promise<ApiResponse<Setting>> {
    const response = await apiService.post<ApiResponse<Setting>>(
      API_ENDPOINTS.SETTINGS.CREATE,
      data
    );
    return response.data;
  }

  async get(id: string): Promise<ApiResponse<Setting>> {
    const response = await apiService.get<ApiResponse<Setting>>(
      API_ENDPOINTS.SETTINGS.GET(id)
    );
    return response.data;
  }

  async getByKey(key: string, params?: any): Promise<ApiResponse<Setting>> {
    const response = await apiService.get<ApiResponse<Setting>>(
      API_ENDPOINTS.SETTINGS.BY_KEY(key),
      { params }
    );
    return response.data;
  }

  async getValue(key: string, params?: any): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.SETTINGS.VALUE(key),
      { params }
    );
    return response.data;
  }

  async update(id: string, data: UpdateSettingDto): Promise<ApiResponse<Setting>> {
    const response = await apiService.put<ApiResponse<Setting>>(
      API_ENDPOINTS.SETTINGS.UPDATE(id),
      data
    );
    return response.data;
  }

  async updateByKey(key: string, data: { value: string; branchId?: string }): Promise<ApiResponse<Setting>> {
    const response = await apiService.patch<ApiResponse<Setting>>(
      API_ENDPOINTS.SETTINGS.UPDATE_BY_KEY(key),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<ApiResponse<void>>(
      API_ENDPOINTS.SETTINGS.DELETE(id)
    );
    return response.data;
  }

  async getByCategory(category: string, params?: any): Promise<ApiResponse<Setting[]>> {
    const response = await apiService.get<ApiResponse<Setting[]>>(
      API_ENDPOINTS.SETTINGS.BY_CATEGORY(category),
      { params }
    );
    return response.data;
  }

  async bulkUpdate(data: BulkUpdateSettingsDto): Promise<ApiResponse<Setting[]>> {
    const response = await apiService.patch<ApiResponse<Setting[]>>(
      API_ENDPOINTS.SETTINGS.BULK_UPDATE,
      data
    );
    return response.data;
  }

  async initializeDefaults(): Promise<ApiResponse<void>> {
    const response = await apiService.post<ApiResponse<void>>(
      API_ENDPOINTS.SETTINGS.INITIALIZE
    );
    return response.data;
  }
}

export const settingService = new SettingService();
