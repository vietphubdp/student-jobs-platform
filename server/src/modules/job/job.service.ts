import { JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { canJobTransition } from './job.state-machine';
import { CreateJobInput, UpdateJobInput } from './job.schema';

export interface GetEmployerJobsQuery {
  status?: JobStatus;
  page?: number;
  limit?: number;
}

export interface GetPublicJobsQuery {
  q?: string;
  category?: string;
  city?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryUnit?: string;
  status?: JobStatus;
  sort?: 'newest' | 'salary_desc' | 'salary_asc' | 'deadline';
  page?: number;
  limit?: number;
}

export class JobService {
  async getPublicJobs(query: GetPublicJobsQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(50, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      isHidden: false,
      status: query.status || JobStatus.OPEN,
      ...(query.category && { categoryId: query.category }),
      ...(query.city && {
        city: { contains: query.city, mode: 'insensitive' },
      }),
      ...(query.location && {
        location: { contains: query.location, mode: 'insensitive' },
      }),
      ...(query.q && {
        OR: [
          { title: { contains: query.q, mode: 'insensitive' } },
          { description: { contains: query.q, mode: 'insensitive' } },
          { location: { contains: query.q, mode: 'insensitive' } },
        ],
      }),
      ...(query.salaryMin && {
        salaryMin: { gte: Number(query.salaryMin) },
      }),
      ...(query.salaryMax && {
        salaryMin: { lte: Number(query.salaryMax) },
      }),
    };

    // Sort order
    let orderBy: Prisma.JobOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'salary_desc') {
      orderBy = { salaryMin: 'desc' };
    } else if (query.sort === 'salary_asc') {
      orderBy = { salaryMin: 'asc' };
    } else if (query.sort === 'deadline') {
      orderBy = { deadline: 'asc' };
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          employer: {
            select: {
              id: true,
              email: true,
              employerProfile: {
                select: {
                  companyName: true,
                  address: true,
                  phone: true,
                  isVerified: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async createJob(employerId: string, data: CreateJobInput) {
    // 1. Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError('Ngành nghề không tồn tại', 400, 'CATEGORY_NOT_FOUND');
    }

    // 2. Create job
    const job = await prisma.job.create({
      data: {
        employerId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        workTime: data.workTime,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax || null,
        salaryUnit: data.salaryUnit,
        location: data.location,
        city: data.city,
        slots: data.slots,
        deadline: new Date(data.deadline),
        status: data.status || JobStatus.OPEN,
      },
      include: {
        category: true,
      },
    });

    return job;
  }

  async getEmployerJobs(employerId: string, query: GetEmployerJobsQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(50, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      employerId,
      ...(query.status && { status: query.status }),
    };

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
    ]);

    // Count accepted applications per job for slot monitoring
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const acceptedCount = await prisma.application.count({
          where: {
            jobId: job.id,
            status: 'ACCEPTED',
          },
        });
        return {
          ...job,
          acceptedCount,
        };
      })
    );

    return {
      jobs: jobsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getJobById(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        category: true,
        employer: {
          select: {
            id: true,
            email: true,
            employerProfile: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new AppError('Không tìm thấy tin việc làm', 404, 'JOB_NOT_FOUND');
    }

    return job;
  }

  async updateJob(jobId: string, employerId: string, data: UpdateJobInput) {
    // 1. Check job existence & ownership (BR3)
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existingJob) {
      throw new AppError('Không tìm thấy tin việc làm', 404, 'JOB_NOT_FOUND');
    }

    if (existingJob.employerId !== employerId) {
      throw new AppError('Bạn không có quyền chỉnh sửa công việc này', 403, 'FORBIDDEN');
    }

    // 2. Validate category if updating
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new AppError('Ngành nghề không tồn tại', 400, 'CATEGORY_NOT_FOUND');
      }
    }

    // 3. State transition validation if status is changing
    if (data.status && data.status !== existingJob.status) {
      if (!canJobTransition(existingJob.status, data.status)) {
        throw new AppError(
          `Không thể chuyển trạng thái công việc từ ${existingJob.status} sang ${data.status}`,
          400,
          'INVALID_STATE_TRANSITION'
        );
      }
    }

    // 4. Update
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.workTime !== undefined && { workTime: data.workTime }),
        ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
        ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
        ...(data.salaryUnit !== undefined && { salaryUnit: data.salaryUnit }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.slots !== undefined && { slots: data.slots }),
        ...(data.deadline !== undefined && { deadline: new Date(data.deadline) }),
        ...(data.status !== undefined && {
          status: data.status,
          ...(data.status === JobStatus.COMPLETED && { completedAt: new Date() }),
        }),
      },
      include: {
        category: true,
      },
    });

    return updatedJob;
  }

  async changeJobStatus(jobId: string, employerId: string, nextStatus: JobStatus) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new AppError('Không tìm thấy tin việc làm', 404, 'JOB_NOT_FOUND');
    }

    if (job.employerId !== employerId) {
      throw new AppError('Bạn không có quyền thay đổi trạng thái công việc này', 403, 'FORBIDDEN');
    }

    // Pure state machine validation (Section 9.3)
    if (!canJobTransition(job.status, nextStatus)) {
      throw new AppError(
        `Không thể chuyển trạng thái công việc từ ${job.status} sang ${nextStatus}`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    if (nextStatus === JobStatus.COMPLETED) {
      const updatedJob = await prisma.$transaction(async (tx) => {
        const jobRes = await tx.job.update({
          where: { id: jobId },
          data: {
            status: JobStatus.COMPLETED,
            completedAt: new Date(),
          },
          include: {
            category: true,
          },
        });

        // Notify all accepted students (BR9)
        const acceptedApps = await tx.application.findMany({
          where: {
            jobId,
            status: 'ACCEPTED',
          },
        });

        if (acceptedApps.length > 0) {
          await tx.notification.createMany({
            data: acceptedApps.map((app) => ({
              userId: app.studentId,
              type: 'JOB_COMPLETED',
              title: 'Công việc đã hoàn thành!',
              content: `Nhà tuyển dụng đã đánh dấu hoàn thành công việc "${job.title}". Bạn có thể gửi đánh giá trải nghiệm làm việc ngay bây giờ.`,
              link: '/student/applications',
            })),
          });
        }

        return jobRes;
      });

      return updatedJob;
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: nextStatus,
      },
      include: {
        category: true,
      },
    });

    return updatedJob;
  }

  async deleteJob(jobId: string, employerId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new AppError('Không tìm thấy tin việc làm', 404, 'JOB_NOT_FOUND');
    }

    if (job.employerId !== employerId) {
      throw new AppError('Bạn không có quyền xóa công việc này', 403, 'FORBIDDEN');
    }

    // Delete job (cascades applications)
    await prisma.job.delete({
      where: { id: jobId },
    });

    return { message: 'Đã xóa tin tuyển dụng thành công' };
  }

  async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

export const jobService = new JobService();
