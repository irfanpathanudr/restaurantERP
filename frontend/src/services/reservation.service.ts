import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';

export interface ReservationListParams {
  branchId?: string;
  customerId?: string;
  status?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateReservationPayload {
  reservation_number: string;
  branch_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  table_id?: string;
  special_requests?: string;
}

class ReservationService {
  async list(params?: ReservationListParams) {
    const response = await apiService.get(API_ENDPOINTS.RESERVATIONS.LIST, { params });
    return response.data.data || [];
  }

  async get(id: string) {
    const response = await apiService.get(API_ENDPOINTS.RESERVATIONS.GET(id));
    return response.data.data;
  }

  async create(data: CreateReservationPayload) {
    const response = await apiService.post(API_ENDPOINTS.RESERVATIONS.CREATE, data);
    return response.data.data;
  }

  async update(id: string, data: Partial<CreateReservationPayload>) {
    const response = await apiService.put(API_ENDPOINTS.RESERVATIONS.UPDATE(id), data);
    return response.data.data;
  }

  async delete(id: string) {
    const response = await apiService.delete(API_ENDPOINTS.RESERVATIONS.DELETE(id));
    return response.data;
  }

  async confirm(id: string) {
    const response = await apiService.patch(API_ENDPOINTS.RESERVATIONS.CONFIRM(id));
    return response.data.data;
  }

  async cancel(id: string, reason?: string) {
    const response = await apiService.patch(API_ENDPOINTS.RESERVATIONS.CANCEL(id), { reason });
    return response.data.data;
  }

  async checkIn(id: string) {
    const response = await apiService.patch(API_ENDPOINTS.RESERVATIONS.CHECK_IN(id));
    return response.data.data;
  }

  async markNoShow(id: string) {
    const response = await apiService.patch(API_ENDPOINTS.RESERVATIONS.NO_SHOW(id));
    return response.data.data;
  }

  async assignTable(id: string, tableId: string) {
    const response = await apiService.patch(API_ENDPOINTS.RESERVATIONS.ASSIGN_TABLE(id), {
      tableId,
    });
    return response.data.data;
  }
}

export const reservationService = new ReservationService();
