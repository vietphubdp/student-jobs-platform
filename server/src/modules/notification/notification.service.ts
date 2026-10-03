import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { getPaginationMeta } from '../../utils/pagination';
import { GetNotificationsQueryInput } from './notification.schema';

export class NotificationService {
  /**
   * Get paginated notifications for a user, with unread count
   */
  async getUserNotifications(userId: string, query: GetNotificationsQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.unreadOnly) {
      where.isRead = false;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get unread notifications count for a user (efficient for polling)
   */
  async getUnreadCount(userId: string) {
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Không tìm thấy thông báo', 404, 'NOTIFICATION_NOT_FOUND');
    }

    if (notification.userId !== userId) {
      throw new AppError('Bạn không có quyền thao tác trên thông báo này', 403, 'FORBIDDEN');
    }

    if (notification.isRead) {
      return notification;
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  }

  /**
   * Mark all notifications of a user as read
   */
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      count: result.count,
    };
  }
}

export const notificationService = new NotificationService();
