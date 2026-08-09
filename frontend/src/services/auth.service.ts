import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
  User,
} from '@/types/auth.types';
import { ApiResponse } from '@/types/common.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Store tokens
    if (response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      apiService.resetSessionState();
    }
    
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    
    // Store tokens
    if (response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      apiService.resetSessionState();
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
  }

  async sendOtp(email: string): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(API_ENDPOINTS.AUTH.SEND_OTP, { email });
    return response.data;
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return response.data.data!;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
