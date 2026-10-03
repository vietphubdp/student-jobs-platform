import { apiClient } from './client';
import {
  AdminStats,
  AdminUser,
  AdminJob,
  AdminReview,
} from '../types/admin';

export const adminApi = {
  /**
   * Get system-wide statistics for Admin dashboard
   */
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<{ data: AdminStats }>('/admin/stats');
    return response.data.data;
  },

  /**
   * Get users list with pagination and search
   */
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    q?: string;
  }): Promise<{ users: AdminUser[]; pagination?: any }> => {
    const response = await apiClient.get<{
      data: AdminUser[];
      meta?: { pagination?: any };
    }>('/admin/users', { params });
    return {
      users: response.data.data,
      pagination: response.data.meta?.pagination,
    };
  },

  /**
   * Update user status (e.g. BANNED or ACTIVE)
   */
  updateUserStatus: async (
    userId: string,
    status: 'ACTIVE' | 'PENDING' | 'BANNED'
  ): Promise<any> => {
    const response = await apiClient.patch<{ data: any }>(
      `/admin/users/${userId}/status`,
      { status }
    );
    return response.data.data;
  },

  /**
   * Get jobs list for moderation
   */
  getJobs: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    isHidden?: boolean;
    categoryId?: string;
    q?: string;
  }): Promise<{ jobs: AdminJob[]; pagination?: any }> => {
    const response = await apiClient.get<{
      data: AdminJob[];
      meta?: { pagination?: any };
    }>('/admin/jobs', {
      params: {
        ...params,
        isHidden: params?.isHidden !== undefined ? String(params.isHidden) : undefined,
      },
    });
    return {
      jobs: response.data.data,
      pagination: response.data.meta?.pagination,
    };
  },

  /**
   * Toggle job hidden state
   */
  toggleJobHide: async (jobId: string, isHidden?: boolean): Promise<AdminJob> => {
    const response = await apiClient.patch<{ data: AdminJob }>(
      `/admin/jobs/${jobId}/hide`,
      { isHidden }
    );
    return response.data.data;
  },

  /**
   * Get reviews list for moderation
   */
  getReviews: async (params?: {
    page?: number;
    limit?: number;
    isHidden?: boolean;
    rating?: number;
  }): Promise<{ reviews: AdminReview[]; pagination?: any }> => {
    const response = await apiClient.get<{
      data: AdminReview[];
      meta?: { pagination?: any };
    }>('/admin/reviews', {
      params: {
        ...params,
        isHidden: params?.isHidden !== undefined ? String(params.isHidden) : undefined,
      },
    });
    return {
      reviews: response.data.data,
      pagination: response.data.meta?.pagination,
    };
  },

  /**
   * Toggle review hidden state (BR6)
   */
  toggleReviewHide: async (reviewId: string, isHidden?: boolean): Promise<AdminReview> => {
    const response = await apiClient.patch<{ data: AdminReview }>(
      `/admin/reviews/${reviewId}/hide`,
      { isHidden }
    );
    return response.data.data;
  },
};
