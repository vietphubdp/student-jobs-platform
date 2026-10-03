import { Request, Response, NextFunction } from 'express';
import { profileService } from './profile.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { Role } from '@prisma/client';

export class ProfileController {
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const profile = await profileService.getProfile(userId);
      return sendSuccess(res, { profile });
    } catch (error) {
      return next(error);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;

      let updatedProfile;
      if (role === Role.STUDENT) {
        updatedProfile = await profileService.updateStudentProfile(userId, req.body);
      } else if (role === Role.EMPLOYER) {
        updatedProfile = await profileService.updateEmployerProfile(userId, req.body);
      } else {
        throw new AppError('Admin không có hồ sơ cá nhân cần cập nhật', 400, 'INVALID_ACTION');
      }

      return sendSuccess(res, { profile: updatedProfile }, 200);
    } catch (error) {
      return next(error);
    }
  }

  async uploadCv(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('Vui lòng chọn file PDF để tải lên', 400, 'FILE_REQUIRED');
      }

      const userId = req.user!.id;
      const result = await profileService.updateCv(userId, req.file.filename);
      return sendSuccess(res, result, 200);
    } catch (error) {
      return next(error);
    }
  }
}

export const profileController = new ProfileController();
