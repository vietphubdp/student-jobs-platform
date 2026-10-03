import { Router } from 'express';
import { jobController } from './job.controller';
import { applicationController } from '../application/application.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createJobSchema, updateJobSchema, changeJobStatusSchema } from './job.schema';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  withdrawApplicationSchema,
} from '../application/application.schema';
import { Role } from '@prisma/client';

const router = Router();

// 1. Categories
router.get('/categories', jobController.getCategories);

// 2. Employer-specific jobs route
router.get('/employer/jobs', authenticate, authorize(Role.EMPLOYER), jobController.getEmployerJobs);

// 3. Job Public Listing & Search
router.get('/jobs', jobController.getPublicJobs);

// 4. Job CRUD
router.post(
  '/jobs',
  authenticate,
  authorize(Role.EMPLOYER),
  validate(createJobSchema),
  jobController.createJob
);

// 5. Job Applications
router.post(
  '/jobs/:id/applications',
  authenticate,
  authorize(Role.STUDENT),
  validate(createApplicationSchema),
  applicationController.applyJob
);

router.get(
  '/jobs/:id/applications',
  authenticate,
  authorize(Role.EMPLOYER),
  applicationController.getJobApplications
);

// 6. Student Applications
router.get(
  '/student/applications',
  authenticate,
  authorize(Role.STUDENT),
  applicationController.getStudentApplications
);

router.patch(
  '/applications/:id/withdraw',
  authenticate,
  authorize(Role.STUDENT),
  validate(withdrawApplicationSchema),
  applicationController.withdrawApplication
);

router.patch(
  '/applications/:id/status',
  authenticate,
  authorize(Role.EMPLOYER),
  validate(updateApplicationStatusSchema),
  applicationController.updateApplicationStatus
);

router.get('/jobs/:id', jobController.getJobById);

router.put(
  '/jobs/:id',
  authenticate,
  authorize(Role.EMPLOYER),
  validate(updateJobSchema),
  jobController.updateJob
);

router.delete(
  '/jobs/:id',
  authenticate,
  authorize(Role.EMPLOYER),
  jobController.deleteJob
);

router.patch(
  '/jobs/:id/status',
  authenticate,
  authorize(Role.EMPLOYER),
  validate(changeJobStatusSchema),
  jobController.changeJobStatus
);

export default router;
