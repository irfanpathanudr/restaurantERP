import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';

export type OrderStatusValue =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export interface OrderListParams {
  branchId?: string;
  status?: string;
  orderType?: string;
  customerId?: string;
  tableId?: string;
  startDate?: string;
  endDate?: string;
  activeOnly?: boolean;
}

export interface CreateOrderPayload {
  branchId: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableId?: string;
  customerId?: string;
  items: {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }[];
  notes?: string;
  kitchenId?: string;
  createKot?: boolean;
  discountAmount?: number;
}

class OrderService {
  async list(params?: OrderListParams) {
    const response = await apiService.get(API_ENDPOINTS.ORDERS.LIST, {
      params: {
        ...params,
        activeOnly: params?.activeOnly ? 'true' : undefined,
      },
    });
    return response.data.data || [];
  }

  async get(id: string) {
    const response = await apiService.get(API_ENDPOINTS.ORDERS.GET(id));
    return response.data.data;
  }

  async getActiveByTable(tableId: string) {
    const response = await apiService.get(API_ENDPOINTS.ORDERS.BY_TABLE(tableId));
    return response.data.data;
  }

  async create(payload: CreateOrderPayload) {
    const response = await apiService.post(API_ENDPOINTS.ORDERS.CREATE, payload);
    return response.data.data;
  }

  async update(id: string, data: { status?: OrderStatusValue; notes?: string }) {
    const response = await apiService.put(API_ENDPOINTS.ORDERS.UPDATE(id), data);
    return response.data.data;
  }

  async updateStatus(id: string, status: OrderStatusValue) {
    const response = await apiService.patch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
    return response.data.data;
  }

  async complete(id: string) {
    const response = await apiService.post(API_ENDPOINTS.ORDERS.COMPLETE(id));
    return response.data.data;
  }

  async cancel(id: string) {
    const response = await apiService.post(API_ENDPOINTS.ORDERS.CANCEL(id));
    return response.data.data;
  }

  async updateItemQuantity(orderId: string, itemId: string, quantity: number) {
    const response = await apiService.patch(
      API_ENDPOINTS.ORDERS.UPDATE_ITEM(orderId, itemId),
      { quantity }
    );
    return response.data.data;
  }

  async removeItem(orderId: string, itemId: string) {
    const response = await apiService.delete(API_ENDPOINTS.ORDERS.REMOVE_ITEM(orderId, itemId));
    return response.data.data;
  }

  async addItems(
    orderId: string,
    payload: {
      items: CreateOrderPayload['items'];
      kitchenId?: string;
      notes?: string;
      createKot?: boolean;
    }
  ) {
    const response = await apiService.post(API_ENDPOINTS.ORDERS.ADD_ITEMS(orderId), payload);
    return response.data.data;
  }

  async applyDiscount(
    orderId: string,
    data: { discountType: 'percentage' | 'fixed'; discountValue: number; reason?: string }
  ) {
    const response = await apiService.post(API_ENDPOINTS.ORDERS.DISCOUNT(orderId), data);
    return response.data.data;
  }

  async createInvoice(orderId: string, notes?: string) {
    const response = await apiService.post(API_ENDPOINTS.INVOICES.CREATE, {
      orderId,
      notes,
    });
    return response.data.data;
  }

  async recordPayment(payload: {
    orderId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  }) {
    const response = await apiService.post(API_ENDPOINTS.PAYMENTS.CREATE, payload);
    return response.data.data;
  }
}

export const orderService = new OrderService();
