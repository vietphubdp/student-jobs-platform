import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { getNotificationsQuerySchema } from './notification.schema';

const router = Router();

// GET /api/notifications -> Get user notifications (paginated + unreadCount)
router.get(
  '/notifications',
  authenticate,
  validate(getNotificationsQuerySchema),
  notificationController.getUserNotifications
);

// GET /api/notifications/unread-count -> Get count of unread notifications
router.get(
  '/notifications/unread-count',
  authenticate,
  notificationController.getUnreadCount
);

// PATCH /api/notifications/read-all -> Mark all notifications as read
router.patch(
  '/notifications/read-all',
  authenticate,
  notificationController.markAllAsRead
);

// PATCH /api/notifications/:id/read -> Mark single notification as read
router.patch(
  '/notifications/:id/read',
  authenticate,
  notificationController.markAsRead
);

export default router;
