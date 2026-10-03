import { apiClient } from './client';
import { Notification, NotificationsResponse } from '../types/notification';

export const notificationApi = {
  /**
   * Get user's notifications (paginated + unreadCount)
   */
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsResponse & { pagination?: any }> => {
    const response = await apiClient.get<{
      data: NotificationsResponse;
      meta?: { pagination?: any };
    }>('/notifications', {
      params: {
        page: params?.page,
        limit: params?.limit,
        unreadOnly: params?.unreadOnly ? 'true' : undefined,
      },
    });

    return {
      ...response.data.data,
      pagination: response.data.meta?.pagination,
    };
  },

  /**
   * Get unread notifications count (fast polling)
   */
  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await apiClient.get<{ data: { unreadCount: number } }>(
      '/notifications/unread-count'
    );
    return response.data.data;
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch<{ data: Notification }>(
      `/notifications/${notificationId}/read`
    );
    return response.data.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ count: number }> => {
    const response = await apiClient.patch<{ data: { count: number } }>(
      '/notifications/read-all'
    );
    return response.data.data;
  },
};
