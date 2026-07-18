import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '@/config/api';
import toast from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('kot_accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.api.interceptors.response.use(
      (res) => res,
      async (error: AxiosError<{ message?: string }>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('kot_accessToken');
          localStorage.removeItem('kot_refreshToken');
          localStorage.removeItem('kot_user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        const msg = error.response?.data?.message || error.message || 'Request failed';
        if (error.response?.status !== 401) toast.error(msg);
        return Promise.reject(error);
      }
    );
  }

  get<T = unknown>(url: string, params?: Record<string, unknown>) {
    return this.api.get<{ success: boolean; data: T; message?: string }>(url, { params });
  }

  post<T = unknown>(url: string, body?: unknown) {
    return this.api.post<{ success: boolean; data: T; message?: string }>(url, body);
  }

  put<T = unknown>(url: string, body?: unknown) {
    return this.api.put<{ success: boolean; data: T; message?: string }>(url, body);
  }

  patch<T = unknown>(url: string, body?: unknown) {
    return this.api.patch<{ success: boolean; data: T; message?: string }>(url, body);
  }

  delete<T = unknown>(url: string) {
    return this.api.delete<{ success: boolean; data: T; message?: string }>(url);
  }
}

export const api = new ApiService();
