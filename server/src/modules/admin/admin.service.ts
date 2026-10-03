import { Role, UserStatus, JobStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { getPaginationMeta } from '../../utils/pagination';
import {
  GetAdminUsersQuery,
  GetAdminJobsQuery,
  GetAdminReviewsQuery,
} from './admin.schema';

export class AdminService {
  /**
   * System-wide statistics for Admin Dashboard
   */
  async getStats() {
    const [
      totalUsers,
      studentCount,
      employerCount,
      bannedUserCount,
      totalJobs,
      openJobsCount,
      filledJobsCount,
      completedJobsCount,
      closedJobsCount,
      hiddenJobsCount,
      totalApplications,
      pendingAppsCount,
      acceptedAppsCount,
      rejectedAppsCount,
      withdrawnAppsCount,
      totalReviews,
      hiddenReviewsCount,
      reviewAvg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.EMPLOYER } }),
      prisma.user.count({ where: { status: UserStatus.BANNED } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: JobStatus.OPEN, isHidden: false } }),
      prisma.job.count({ where: { status: JobStatus.FILLED } }),
      prisma.job.count({ where: { status: JobStatus.COMPLETED } }),
      prisma.job.count({ where: { status: JobStatus.CLOSED } }),
      prisma.job.count({ where: { isHidden: true } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'ACCEPTED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.application.count({ where: { status: 'WITHDRAWN' } }),
      prisma.review.count(),
      prisma.review.count({ where: { isHidden: true } }),
      prisma.review.aggregate({ where: { isHidden: false }, _avg: { rating: true } }),
    ]);

    return {
      users: {
        total: totalUsers,
        students: studentCount,
        employers: employerCount,
        banned: bannedUserCount,
      },
      jobs: {
        total: totalJobs,
        open: openJobsCount,
        filled: filledJobsCount,
        completed: completedJobsCount,
        closed: closedJobsCount,
        hidden: hiddenJobsCount,
      },
      applications: {
        total: totalApplications,
        pending: pendingAppsCount,
        accepted: acceptedAppsCount,
        rejected: rejectedAppsCount,
        withdrawn: withdrawnAppsCount,
      },
      reviews: {
        total: totalReviews,
        hidden: hiddenReviewsCount,
        averageRating: reviewAvg._avg.rating
          ? Math.round(reviewAvg._avg.rating * 10) / 10
          : 0,
      },
    };
  }

  /**
   * Get paginated users with search & filters
   */
  async getUsers(query: GetAdminUsersQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.q) {
      const search = query.q.trim();
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { studentProfile: { fullName: { contains: search, mode: 'insensitive' } } },
        { employerProfile: { companyName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          studentProfile: true,
          employerProfile: true,
          _count: {
            select: {
              employerJobs: true,
              applications: true,
              reviewsReceived: true,
            },
          },
        },
      }),
    ]);

    return {
      users,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  /**
   * Update user status (e.g. BANNED or ACTIVE)
   */
  async updateUserStatus(adminId: string, targetUserId: string, nextStatus: UserStatus) {
    if (adminId === targetUserId) {
      throw new AppError('Bạn không thể tự khóa tài khoản quản trị viên của chính mình', 400, 'CANNOT_BAN_SELF');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new AppError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: nextStatus },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Get paginated jobs for moderation
   */
  async getJobs(query: GetAdminJobsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.isHidden !== undefined) {
      where.isHidden = query.isHidden;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.q) {
      const search = query.q.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { employer: { employerProfile: { companyName: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      }),
    ]);

    return {
      jobs,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  /**
   * Toggle job hidden state
   */
  async toggleJobHide(jobId: string, isHidden?: boolean) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new AppError('Không tìm thấy tin việc làm', 404, 'JOB_NOT_FOUND');
    }

    const nextHiddenState = isHidden !== undefined ? isHidden : !job.isHidden;

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { isHidden: nextHiddenState },
      include: {
        category: true,
        employer: {
          select: {
            id: true,
            email: true,
            employerProfile: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Get paginated reviews for moderation
   */
  async getReviews(query: GetAdminReviewsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.isHidden !== undefined) {
      where.isHidden = query.isHidden;
    }

    if (query.rating) {
      where.rating = query.rating;
    }

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              role: true,
              studentProfile: true,
              employerProfile: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              role: true,
              studentProfile: true,
              employerProfile: true,
            },
          },
          application: {
            select: {
              id: true,
              job: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      reviews,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  /**
   * Toggle review hidden state (BR6)
   */
  async toggleReviewHide(reviewId: string, isHidden?: boolean) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Không tìm thấy đánh giá', 404, 'REVIEW_NOT_FOUND');
    }

    const nextHiddenState = isHidden !== undefined ? isHidden : !review.isHidden;

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { isHidden: nextHiddenState },
      include: {
        reviewer: {
          select: {
            id: true,
            role: true,
            studentProfile: true,
            employerProfile: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            role: true,
            studentProfile: true,
            employerProfile: true,
          },
        },
      },
    });

    return updated;
  }
}

export const adminService = new AdminService();
