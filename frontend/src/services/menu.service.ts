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
}

export const menuService = new MenuService();
