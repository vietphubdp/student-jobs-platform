import { Router } from 'express';
import { applicationController } from './application.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  withdrawApplicationSchema,
} from './application.schema';
import { Role } from '@prisma/client';

const router = Router();

// STUDENT Routes
// POST /api/jobs/:id/applications -> Apply for a job
router.post(
  '/jobs/:id/applications',
  authenticate,
  authorize(Role.STUDENT),
  validate(createApplicationSchema),
  applicationController.applyJob
);

// GET /api/student/applications -> Get student's applications
router.get(
  '/student/applications',
  authenticate,
  authorize(Role.STUDENT),
  applicationController.getStudentApplications
);

// PATCH /api/applications/:id/withdraw -> Student withdraws an application
router.patch(
  '/applications/:id/withdraw',
  authenticate,
  authorize(Role.STUDENT),
  validate(withdrawApplicationSchema),
  applicationController.withdrawApplication
);

// EMPLOYER Routes
// GET /api/jobs/:id/applications -> Get applications for a specific job (owner only)
router.get(
  '/jobs/:id/applications',
  authenticate,
  authorize(Role.EMPLOYER),
  applicationController.getJobApplications
);

// PATCH /api/applications/:id/status -> Accept/Reject application (owner only)
router.patch(
  '/applications/:id/status',
  authenticate,
  authorize(Role.EMPLOYER),
  validate(updateApplicationStatusSchema),
  applicationController.updateApplicationStatus
);

export default router;
