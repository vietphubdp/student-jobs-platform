import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export const getHealth = async () => {
  const response = await apiClient.get<ApiResponse<{
    status: string;
    service: string;
    timestamp: string;
    database: string;
    environment: string;
  }>>('/health');
  return response.data;
};
