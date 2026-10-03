import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { Role, UserStatus, JobStatus } from '@prisma/client';

export class AdminController {
  /**
   * GET /api/admin/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getStats();
      return sendSuccess(res, stats, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users
   */
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, role, status, q } = req.query;

      const result = await adminService.getUsers({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        role: role as Role | undefined,
        status: status as UserStatus | undefined,
        q: q as string | undefined,
      });

      return sendSuccess(res, result.users, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/users/:id/status
   */
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;

      const updated = await adminService.updateUserStatus(adminId, targetUserId, status);
      return sendSuccess(res, updated, 200, { message: 'Cập nhật trạng thái người dùng thành công' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/jobs
   */
  async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, isHidden, categoryId, q } = req.query;

      const result = await adminService.getJobs({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        status: status as JobStatus | undefined,
        isHidden: isHidden === 'true' ? true : isHidden === 'false' ? false : undefined,
        categoryId: categoryId as string | undefined,
        q: q as string | undefined,
      });

      return sendSuccess(res, result.jobs, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/jobs/:id/hide
   */
  async toggleJobHide(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { isHidden } = req.body || {};

      const updated = await adminService.toggleJobHide(jobId, isHidden);
      return sendSuccess(
        res,
        updated,
        200,
        { message: updated.isHidden ? 'Đã ẩn tin việc làm' : 'Đã hiện lại tin việc làm' }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/reviews
   */
  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, isHidden, rating } = req.query;

      const result = await adminService.getReviews({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        isHidden: isHidden === 'true' ? true : isHidden === 'false' ? false : undefined,
        rating: rating ? parseInt(rating as string, 10) : undefined,
      });

      return sendSuccess(res, result.reviews, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/reviews/:id/hide
   */
  async toggleReviewHide(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { isHidden } = req.body || {};

      const updated = await adminService.toggleReviewHide(reviewId, isHidden);
      return sendSuccess(
        res,
        updated,
        200,
        { message: updated.isHidden ? 'Đã ẩn đánh giá vi phạm' : 'Đã hiển thị lại đánh giá' }
      );
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
