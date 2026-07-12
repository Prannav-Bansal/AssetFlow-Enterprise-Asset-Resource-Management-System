import api from './axios';
import { LoginInput, SignupInput, ForgotPasswordInput, AuthResponse } from '@/types/auth';
import { ApiResponse } from '@/types';

export const authApi = {
  login: async (credentials: LoginInput) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  signup: async (data: SignupInput) => {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    const response = await api.post<ApiResponse<null>>('/auth/forgot-password', data);
    return response.data;
  },
};
