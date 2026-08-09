import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api';
import toast from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private sessionExpired = false;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (this.sessionExpired) {
          return Promise.reject(new axios.Cancel('Session expired'));
        }

        const token = localStorage.getItem('kot_accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with token refresh
    this.api.interceptors.response.use(
      (res) => res,
      async (error: AxiosError<{ message?: string }>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401) {
          // Only attempt token refresh for authenticated requests that haven't retried yet
          if (!originalRequest._retry && originalRequest.url !== '/auth/login') {
            if (this.isRefreshing) {
              return new Promise((resolve) => {
                this.refreshSubscribers.push((token: string) => {
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  resolve(this.api(originalRequest));
                });
              });
            }

            originalRequest._retry = true;
            this.isRefreshing = true;

            try {
              const refreshToken = localStorage.getItem('kot_refreshToken');
              if (!refreshToken) {
                throw new Error('No refresh token');
              }

              const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;

              localStorage.setItem('kot_accessToken', accessToken);
              localStorage.setItem('kot_refreshToken', newRefreshToken);

              this.refreshSubscribers.forEach((callback) => callback(accessToken));
              this.refreshSubscribers = [];

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }

              return this.api(originalRequest);
            } catch (refreshError) {
              this.handleSessionExpired();
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          }

          if (originalRequest._retry) {
            this.handleSessionExpired();
          }

          return Promise.reject(error);
        }

        const msg = error.response?.data?.message || error.message || 'Request failed';
        if (error.response?.status !== 401 && !axios.isCancel(error)) {
          toast.error(msg);
        }
        return Promise.reject(error);
      }
    );
  }

  private handleSessionExpired(): void {
    if (this.sessionExpired) return;
    this.sessionExpired = true;

    localStorage.removeItem('kot_accessToken');
    localStorage.removeItem('kot_refreshToken');
    localStorage.removeItem('kot_user');

    if (!window.location.pathname.includes('/login')) {
      toast.error('Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
  }

  public resetSessionState(): void {
    this.sessionExpired = false;
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
