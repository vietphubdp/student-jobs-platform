import { Router } from 'express';
import { profileController } from './profile.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { uploadCvMiddleware } from '../../middlewares/upload';
import { Role } from '@prisma/client';

const router = Router();

// Get current user profile
router.get('/me', authenticate, profileController.getMyProfile);

// Update current user profile (Student or Employer)
router.put('/me', authenticate, profileController.updateMyProfile);

// Upload CV (Only Student allowed)
router.post(
  '/cv',
  authenticate,
  authorize(Role.STUDENT),
  uploadCvMiddleware.single('cv'),
  profileController.uploadCv
);

export default router;
