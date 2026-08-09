import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '@/config/api';
import toast from 'react-hot-toast';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { clearAuthStorage, getAccessToken, isTokenExpired } from '@/utils/session';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private sessionExpired = false;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
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

        const token = getAccessToken();
        if (token) {
          if (isTokenExpired(token)) {
            this.handleSessionExpired();
            return Promise.reject(new axios.Cancel('Session expired'));
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
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
              const refreshToken = localStorage.getItem('refreshToken');
              if (!refreshToken) {
                throw new Error('No refresh token');
              }

              const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;

              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

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

        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        // Handle all other errors with a toast
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleSessionExpired(): void {
    if (this.sessionExpired) return;
    this.sessionExpired = true;

    clearAuthStorage();
    store.dispatch(logout());

    if (!window.location.pathname.includes('/login')) {
      toast.error('Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
  }

  public resetSessionState(): void {
    this.sessionExpired = false;
  }

  private handleError(error: AxiosError): void {
    if (this.sessionExpired || axios.isCancel(error)) return;
    if (error.response) {
      const message = (error.response.data as any)?.message || 'An error occurred';
      toast.error(message);
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }
}

export const apiService = new ApiService();
