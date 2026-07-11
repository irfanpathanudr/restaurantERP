import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { Recipe } from '@/types/entities.types';
import { CreateRecipeDto, UpdateRecipeDto } from '@/types/dto.types';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';

class RecipeService {
  async list(params?: any): Promise<PaginatedResponse<Recipe>> {
    const response = await apiService.get<PaginatedResponse<Recipe>>(
      API_ENDPOINTS.RECIPES.LIST,
      { params }
    );
    return response.data;
  }

  async create(data: CreateRecipeDto): Promise<ApiResponse<Recipe>> {
    const response = await apiService.post<ApiResponse<Recipe>>(
      API_ENDPOINTS.RECIPES.CREATE,
      data
    );
    return response.data;
  }

  async get(id: string): Promise<ApiResponse<Recipe>> {
    const response = await apiService.get<ApiResponse<Recipe>>(
      API_ENDPOINTS.RECIPES.GET(id)
    );
    return response.data;
  }

  async getByMenuItem(menuItemId: string): Promise<ApiResponse<Recipe>> {
    const response = await apiService.get<ApiResponse<Recipe>>(
      API_ENDPOINTS.RECIPES.BY_MENU_ITEM(menuItemId)
    );
    return response.data;
  }

  async update(id: string, data: UpdateRecipeDto): Promise<ApiResponse<Recipe>> {
    const response = await apiService.put<ApiResponse<Recipe>>(
      API_ENDPOINTS.RECIPES.UPDATE(id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<ApiResponse<void>>(
      API_ENDPOINTS.RECIPES.DELETE(id)
    );
    return response.data;
  }

  async calculateCost(id: string): Promise<ApiResponse<Recipe>> {
    const response = await apiService.post<ApiResponse<Recipe>>(
      API_ENDPOINTS.RECIPES.CALCULATE_COST(id)
    );
    return response.data;
  }
}

export const recipeService = new RecipeService();
