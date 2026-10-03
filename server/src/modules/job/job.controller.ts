import { Request, Response, NextFunction } from 'express';
import { jobService } from './job.service';
import { sendSuccess } from '../../utils/response';
import { JobStatus } from '@prisma/client';

export class JobController {
  async getPublicJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string | undefined;
      const category = req.query.category as string | undefined;
      const city = req.query.city as string | undefined;
      const location = req.query.location as string | undefined;
      const salaryMin = req.query.salaryMin ? parseInt(req.query.salaryMin as string, 10) : undefined;
      const salaryMax = req.query.salaryMax ? parseInt(req.query.salaryMax as string, 10) : undefined;
      const status = req.query.status as JobStatus | undefined;
      const sort = req.query.sort as any;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;

      const { jobs, pagination } = await jobService.getPublicJobs({
        q,
        category,
        city,
        location,
        salaryMin,
        salaryMax,
        status,
        sort,
        page,
        limit,
      });

      return sendSuccess(res, { jobs }, 200, { pagination });
    } catch (error) {
      return next(error);
    }
  }

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.id;
      const job = await jobService.createJob(employerId, req.body);
      return sendSuccess(res, { job }, 201);
    } catch (error) {
      return next(error);
    }
  }

  async getEmployerJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.id;
      const status = req.query.status as JobStatus | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const { jobs, pagination } = await jobService.getEmployerJobs(employerId, {
        status,
        page,
        limit,
      });

      return sendSuccess(res, { jobs }, 200, { pagination });
    } catch (error) {
      return next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const job = await jobService.getJobById(id);
      return sendSuccess(res, { job }, 200);
    } catch (error) {
      return next(error);
    }
  }

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const employerId = req.user!.id;
      const job = await jobService.updateJob(id, employerId, req.body);
      return sendSuccess(res, { job }, 200);
    } catch (error) {
      return next(error);
    }
  }

  async changeJobStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const employerId = req.user!.id;
      const { status } = req.body;
      const job = await jobService.changeJobStatus(id, employerId, status);
      return sendSuccess(res, { job }, 200);
    } catch (error) {
      return next(error);
    }
  }

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const employerId = req.user!.id;
      const result = await jobService.deleteJob(id, employerId);
      return sendSuccess(res, result, 200);
    } catch (error) {
      return next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await jobService.getCategories();
      return sendSuccess(res, { categories }, 200);
    } catch (error) {
      return next(error);
    }
  }
}

export const jobController = new JobController();
