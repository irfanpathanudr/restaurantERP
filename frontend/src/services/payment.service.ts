import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';

export interface Payment {
  id: string;
  payment_number: string;
  order_id: string;
  payment_method: string;
  payment_gateway?: string | null;
  amount: number | string;
  transaction_id?: string | null;
  reference_number?: string | null;
  payment_status: string;
  payment_date: string;
  notes?: string | null;
  processed_by?: string | null;
  payment_mode?: string;
  is_split_payment?: boolean;
  payment_sequence?: number;
  created_at?: string;
  updated_at?: string;
}

export class PaymentService {
  async getOrderPayments(orderId: string): Promise<Payment[]> {
    const response = await apiService.get(API_ENDPOINTS.PAYMENTS.BY_ORDER(orderId));
    return response.data.data || [];
  }

  async list(params?: Record<string, any>): Promise<Payment[]> {
    const response = await apiService.get(API_ENDPOINTS.PAYMENTS.LIST, { params });
    return response.data.data || [];
  }

  async get(id: string): Promise<Payment> {
    const response = await apiService.get(API_ENDPOINTS.PAYMENTS.GET(id));
    return response.data.data;
  }

  async create(payload: {
    orderId: string;
    amount: number;
    paymentMethod: string;
    paymentGateway?: string;
    transactionId?: string;
    referenceNumber?: string;
    notes?: string;
  }): Promise<Payment> {
    const response = await apiService.post(API_ENDPOINTS.PAYMENTS.CREATE, payload);
    return response.data.data;
  }

  async refund(id: string, reason?: string): Promise<Payment> {
    const response = await apiService.post(API_ENDPOINTS.PAYMENTS.REFUND(id), { reason });
    return response.data.data;
  }
}

export const paymentService = new PaymentService();
