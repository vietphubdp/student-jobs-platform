import { Request, Response, NextFunction } from 'express';
import { applicationService } from './application.service';
import { sendSuccess } from '../../utils/response';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationController {
  /**
   * POST /api/jobs/:id/applications (STUDENT)
   */
  async applyJob(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.id;
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = req.body;

      const application = await applicationService.applyJob(studentId, jobId, data);
      return sendSuccess(res, application, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/student/applications (STUDENT)
   */
  async getStudentApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.id;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const status = req.query.status as ApplicationStatus | undefined;

      const result = await applicationService.getStudentApplications(studentId, page, limit, status);
      return sendSuccess(res, result.applications, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/applications/:id/withdraw (STUDENT)
   */
  async withdrawApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.id;
      const applicationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { reason } = req.body;

      const application = await applicationService.withdrawApplication(studentId, applicationId, reason);
      return sendSuccess(res, application, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/jobs/:id/applications (EMPLOYER, job owner)
   */
  async getJobApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.id;
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const status = req.query.status as ApplicationStatus | undefined;

      const result = await applicationService.getJobApplications(employerId, jobId, page, limit, status);
      return sendSuccess(
        res,
        {
          job: result.job,
          summary: result.summary,
          applications: result.applications,
        },
        200,
        { pagination: result.pagination }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/applications/:id/status (EMPLOYER, job owner)
   */
  async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.id;
      const applicationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status, reason } = req.body;

      const application = await applicationService.updateApplicationStatus(
        employerId,
        applicationId,
        status,
        reason
      );
      return sendSuccess(res, application, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const applicationController = new ApplicationController();
