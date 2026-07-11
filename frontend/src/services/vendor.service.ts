import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { Vendor } from '@/types/entities.types';
import { CreateVendorDto, UpdateVendorDto, UpdateVendorRatingDto } from '@/types/dto.types';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';

class VendorService {
  async list(params?: any): Promise<PaginatedResponse<Vendor>> {
    const response = await apiService.get<PaginatedResponse<Vendor>>(
      API_ENDPOINTS.VENDORS.LIST,
      { params }
    );
    return response.data;
  }

  async create(data: CreateVendorDto): Promise<ApiResponse<Vendor>> {
    const response = await apiService.post<ApiResponse<Vendor>>(
      API_ENDPOINTS.VENDORS.CREATE,
      data
    );
    return response.data;
  }

  async get(id: string): Promise<ApiResponse<Vendor>> {
    const response = await apiService.get<ApiResponse<Vendor>>(
      API_ENDPOINTS.VENDORS.GET(id)
    );
    return response.data;
  }

  async getByCode(code: string): Promise<ApiResponse<Vendor>> {
    const response = await apiService.get<ApiResponse<Vendor>>(
      API_ENDPOINTS.VENDORS.BY_CODE(code)
    );
    return response.data;
  }

  async update(id: string, data: UpdateVendorDto): Promise<ApiResponse<Vendor>> {
    const response = await apiService.put<ApiResponse<Vendor>>(
      API_ENDPOINTS.VENDORS.UPDATE(id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<ApiResponse<void>>(
      API_ENDPOINTS.VENDORS.DELETE(id)
    );
    return response.data;
  }

  async getTopVendors(params?: any): Promise<ApiResponse<Vendor[]>> {
    const response = await apiService.get<ApiResponse<Vendor[]>>(
      API_ENDPOINTS.VENDORS.TOP,
      { params }
    );
    return response.data;
  }

  async getVendorsWithOutstanding(): Promise<ApiResponse<Vendor[]>> {
    const response = await apiService.get<ApiResponse<Vendor[]>>(
      API_ENDPOINTS.VENDORS.OUTSTANDING
    );
    return response.data;
  }

  async updateRating(id: string, data: UpdateVendorRatingDto): Promise<ApiResponse<Vendor>> {
    const response = await apiService.patch<ApiResponse<Vendor>>(
      API_ENDPOINTS.VENDORS.UPDATE_RATING(id),
      data
    );
    return response.data;
  }

  async getStatement(id: string, params?: any): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ENDPOINTS.VENDORS.STATEMENT(id),
      { params }
    );
    return response.data;
  }
}

export const vendorService = new VendorService();
