import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export class NotificationController {
  /**
   * GET /api/notifications
   * Get user's notifications (paginated)
   */
  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Bạn chưa đăng nhập', 401, 'UNAUTHORIZED');
      }

      const { page, limit, unreadOnly } = req.query;

      const result = await notificationService.getUserNotifications(user.id, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        unreadOnly: unreadOnly === 'true',
      });

      return sendSuccess(
        res,
        {
          notifications: result.notifications,
          unreadCount: result.unreadCount,
        },
        200,
        { pagination: result.pagination }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get count of unread notifications
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Bạn chưa đăng nhập', 401, 'UNAUTHORIZED');
      }

      const result = await notificationService.getUnreadCount(user.id);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark single notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Bạn chưa đăng nhập', 401, 'UNAUTHORIZED');
      }

      const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const notification = await notificationService.markAsRead(user.id, notificationId);

      return sendSuccess(res, notification, 200, { message: 'Đã đánh dấu thông báo là đã đọc' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Bạn chưa đăng nhập', 401, 'UNAUTHORIZED');
      }

      const result = await notificationService.markAllAsRead(user.id);
      return sendSuccess(res, result, 200, { message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
