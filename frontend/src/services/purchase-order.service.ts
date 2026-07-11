import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { PurchaseOrder } from '@/types/entities.types';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  ReceiveItemsDto,
  RejectPurchaseOrderDto,
} from '@/types/dto.types';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';

class PurchaseOrderService {
  async list(params?: any): Promise<PaginatedResponse<PurchaseOrder>> {
    const response = await apiService.get<PaginatedResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.LIST,
      { params }
    );
    return response.data;
  }

  async create(data: CreatePurchaseOrderDto): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.post<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.CREATE,
      data
    );
    return response.data;
  }

  async get(id: string): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.get<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.GET(id)
    );
    return response.data;
  }

  async getByPONumber(poNumber: string): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.get<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.BY_PO_NUMBER(poNumber)
    );
    return response.data;
  }

  async update(id: string, data: UpdatePurchaseOrderDto): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.put<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.UPDATE(id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<ApiResponse<void>>(
      API_ENDPOINTS.PURCHASE_ORDERS.DELETE(id)
    );
    return response.data;
  }

  async submitForApproval(id: string): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.patch<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.SUBMIT(id)
    );
    return response.data;
  }

  async approve(id: string): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.patch<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.APPROVE(id)
    );
    return response.data;
  }

  async reject(id: string, data: RejectPurchaseOrderDto): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.patch<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.REJECT(id),
      data
    );
    return response.data;
  }

  async markAsOrdered(id: string): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.patch<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.MARK_ORDERED(id)
    );
    return response.data;
  }

  async receiveItems(id: string, data: ReceiveItemsDto): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.patch<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.RECEIVE_ITEMS(id),
      data
    );
    return response.data;
  }

  async cancel(id: string): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiService.patch<ApiResponse<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDERS.CANCEL(id)
    );
    return response.data;
  }
}

export const purchaseOrderService = new PurchaseOrderService();
