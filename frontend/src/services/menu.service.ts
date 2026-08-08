import { apiService } from './api.service';
import { MenuItem } from '@/types/entities.types';
import { CreateMenuItemDto, UpdateMenuItemDto } from '@/types/dto.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface MenuItemFilters {
  categoryId?: string;
  foodType?: string;
  isAvailable?: boolean;
  search?: string;
}

interface ImportResult {
  success: Array<{ row: number; name: string; sku: string }>;
  failed: Array<{ row: number; data: any; error: string }>;
}

class MenuService {
  private readonly BASE_PATH = '/menu-items';

  async getAll(filters?: MenuItemFilters): Promise<MenuItem[]> {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.foodType) params.append('foodType', filters.foodType);
    if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable));
    if (filters?.search) params.append('search', filters.search);

    const response = await apiService.get<ApiResponse<MenuItem[]>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response.data.data;
  }

  async search(query: string, filters?: Omit<MenuItemFilters, 'search'>): Promise<MenuItem[]> {
    const params = new URLSearchParams({ q: query });
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.foodType) params.append('foodType', filters.foodType);
    if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable));

    const response = await apiService.get<ApiResponse<MenuItem[]>>(
      `${this.BASE_PATH}/search?${params.toString()}`
    );
    return response.data.data;
  }

  async getWithImages(filters?: Omit<MenuItemFilters, 'search' | 'foodType'>): Promise<MenuItem[]> {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable));

    const response = await apiService.get<ApiResponse<MenuItem[]>>(
      `${this.BASE_PATH}/with-images?${params.toString()}`
    );
    return response.data.data;
  }

  async getById(id: string): Promise<MenuItem> {
    const response = await apiService.get<ApiResponse<MenuItem>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  async create(data: CreateMenuItemDto): Promise<MenuItem> {
    const response = await apiService.post<ApiResponse<MenuItem>>(this.BASE_PATH, data);
    return response.data.data;
  }

  async update(id: string, data: UpdateMenuItemDto): Promise<MenuItem> {
    const response = await apiService.put<ApiResponse<MenuItem>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async toggleAvailability(id: string): Promise<MenuItem> {
    const response = await apiService.patch<ApiResponse<MenuItem>>(
      `${this.BASE_PATH}/${id}/availability`
    );
    return response.data.data;
  }

  async uploadImage(file: File): Promise<{ imageUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiService.post<ApiResponse<{ imageUrl: string; filename: string }>>(
      `${this.BASE_PATH}/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  async exportTemplate(): Promise<Blob> {
    const response = await apiService.get(`${this.BASE_PATH}/export/template`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportMenus(filters?: { categoryId?: string; isAvailable?: boolean }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable));

    const response = await apiService.get(`${this.BASE_PATH}/export/data?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async importMenus(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.post<ApiResponse<ImportResult>>(
      `${this.BASE_PATH}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }
}

export const menuService = new MenuService();
