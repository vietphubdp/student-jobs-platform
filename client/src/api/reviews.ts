import { apiClient } from './client';
import {
  Review,
  UserReviewsResponse,
  CreateReviewData,
  ApplicationReviewsStatus,
} from '../types/review';

export const reviewApi = {
  /**
   * Submit a review for an application
   */
  createReview: async (applicationId: string, data: CreateReviewData): Promise<Review> => {
    const response = await apiClient.post<{ data: Review }>(
      `/applications/${applicationId}/reviews`,
      data
    );
    return response.data.data;
  },

  /**
   * Get public reviews and ratings summary for a user
   */
  getUserReviews: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<UserReviewsResponse & { pagination?: any }> => {
    const response = await apiClient.get<{
      data: UserReviewsResponse;
      meta?: { pagination?: any };
    }>(`/users/${userId}/reviews`, { params });
    return {
      ...response.data.data,
      pagination: response.data.meta?.pagination,
    };
  },

  /**
   * Get review status for an application
   */
  getApplicationReviews: async (applicationId: string): Promise<ApplicationReviewsStatus> => {
    const response = await apiClient.get<{ data: ApplicationReviewsStatus }>(
      `/applications/${applicationId}/reviews`
    );
    return response.data.data;
  },
};
