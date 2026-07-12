import { Department } from './index';

export interface LoginInput { email: string; password: string; }
export interface SignupInput { name: string; email: string; password: string; confirmPassword?: string; department_id?: string; }
export interface ForgotPasswordInput { email: string; }

// The backend returns the user's role as a plain string (e.g. "Admin").
export interface AuthUser { _id: string; name: string; email: string; role: string; department?: Department | string; }
export interface AuthState { user: AuthUser | null; accessToken: string | null; refreshToken: string | null; isAuthenticated: boolean; isLoading: boolean; }

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: { user: AuthUser; accessToken: string; refreshToken: string };
}
