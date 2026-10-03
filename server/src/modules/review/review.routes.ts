import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createReviewSchema, getReviewsQuerySchema } from './review.schema';

const router = Router();

// POST /api/applications/:id/reviews -> Submit a review (authenticated)
router.post(
  '/applications/:id/reviews',
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview
);

// GET /api/applications/:id/reviews -> Get review status for an application (authenticated)
router.get(
  '/applications/:id/reviews',
  authenticate,
  reviewController.getApplicationReviews
);

// GET /api/users/:id/reviews -> Get reviews & average rating for a user (public / authenticated)
router.get(
  '/users/:id/reviews',
  validate(getReviewsQuerySchema),
  reviewController.getUserReviews
);

export default router;
