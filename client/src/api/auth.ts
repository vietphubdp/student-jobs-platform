import { apiClient, ApiResponse } from './client';
import { User, LoginPayload, RegisterPayload } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginPayload): Promise<User> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/login', credentials);
    return response.data.data.user;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', payload);
    return response.data.data.user;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  },
};
