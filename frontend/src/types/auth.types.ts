export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id?: string;
  branch_id?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar: string | null;
  role_id: string | null;
  branch_id: string | null;
  role?: Role;
  is_email_verified: boolean;
  last_login_at: string | null;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  type: string;
  resource: string | null;
  action: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}
