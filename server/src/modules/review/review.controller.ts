import { Request, Response, NextFunction } from 'express';
import { reviewService } from './review.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { CreateReviewInput } from './review.schema';

export class ReviewController {
  /**
   * POST /api/applications/:id/reviews
   * Submit a review for an application
   */
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Bạn chưa đăng nhập', 401, 'UNAUTHORIZED');
      }

      const applicationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data: CreateReviewInput = req.body;

      const review = await reviewService.createReview(user.id, applicationId, data);

      return sendSuccess(res, review, 201, { message: 'Gửi đánh giá thành công' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id/reviews
   * Get public reviews and average rating score for a user
   */
  async getUserReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { page, limit } = req.query;

      const result = await reviewService.getUserReviews(userId, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      });

      return sendSuccess(
        res,
        {
          user: result.user,
          summary: result.summary,
          reviews: result.reviews,
        },
        200,
        { pagination: result.pagination }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/applications/:id/reviews
   * Get review status for an application
   */
  async getApplicationReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Bạn chưa đăng nhập', 401, 'UNAUTHORIZED');
      }

      const applicationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await reviewService.getApplicationReviews(applicationId, user.id);

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
