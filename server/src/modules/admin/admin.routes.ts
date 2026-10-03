import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import {
  updateUserStatusSchema,
  toggleHideSchema,
  getAdminUsersQuerySchema,
  getAdminJobsQuerySchema,
  getAdminReviewsQuerySchema,
} from './admin.schema';
import { Role } from '@prisma/client';

const router = Router();

// Protect all admin routes with authentication & ADMIN authorization (Section 9.1)
router.use(authenticate, authorize(Role.ADMIN));

// GET /api/admin/stats
router.get('/stats', adminController.getStats);

// GET /api/admin/users
router.get('/users', validate(getAdminUsersQuerySchema), adminController.getUsers);

// PATCH /api/admin/users/:id/status
router.patch(
  '/users/:id/status',
  validate(updateUserStatusSchema),
  adminController.updateUserStatus
);

// GET /api/admin/jobs
router.get('/jobs', validate(getAdminJobsQuerySchema), adminController.getJobs);

// PATCH /api/admin/jobs/:id/hide
router.patch(
  '/jobs/:id/hide',
  validate(toggleHideSchema),
  adminController.toggleJobHide
);

// GET /api/admin/reviews
router.get('/reviews', validate(getAdminReviewsQuerySchema), adminController.getReviews);

// PATCH /api/admin/reviews/:id/hide
router.patch(
  '/reviews/:id/hide',
  validate(toggleHideSchema),
  adminController.toggleReviewHide
);

export default router;
