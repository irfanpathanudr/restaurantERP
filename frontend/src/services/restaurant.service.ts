import { apiService } from './api.service';
import { Restaurant } from '@/types/entities.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class RestaurantService {
  private readonly BASE_PATH = '/restaurants';

  async findAll(): Promise<Restaurant[]> {
    const response = await apiService.get<ApiResponse<Restaurant[]>>(this.BASE_PATH);
    return response.data.data || [];
  }

  async findById(id: string): Promise<Restaurant> {
    const response = await apiService.get<ApiResponse<Restaurant>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  async create(data: Record<string, unknown>): Promise<Restaurant> {
    const response = await apiService.post<ApiResponse<Restaurant>>(this.BASE_PATH, data);
    return response.data.data;
  }

  async update(id: string, data: Record<string, unknown>): Promise<Restaurant> {
    const response = await apiService.put<ApiResponse<Restaurant>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}

export const restaurantService = new RestaurantService();
