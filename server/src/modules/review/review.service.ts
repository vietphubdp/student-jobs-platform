import { ApplicationStatus, JobStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { CreateReviewInput, GetReviewsQueryInput } from './review.schema';
import { getPaginationMeta } from '../../utils/pagination';

export class ReviewService {
  /**
   * Create a two-way review for an application (Student -> Employer or Employer -> Student)
   * Enforces:
   * - BR4: Job must be COMPLETED and Application must be ACCEPTED.
   * - BR5: Exactly 1 review per party per application (Rating 1-5, optional comment).
   * - BR9: In-app notification sent to the reviewee.
   */
  async createReview(userId: string, applicationId: string, data: CreateReviewInput) {
    // 1. Fetch application with job, employer, and student details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            employer: {
              include: { employerProfile: true },
            },
          },
        },
        student: {
          include: { studentProfile: true },
        },
      },
    });

    if (!application) {
      throw new AppError('Không tìm thấy đơn ứng tuyển', 404, 'APPLICATION_NOT_FOUND');
    }

    // 2. Enforce BR4: Job must be COMPLETED & Application must be ACCEPTED
    if (application.job.status !== JobStatus.COMPLETED) {
      throw new AppError(
        'Chỉ có thể đánh giá khi công việc đã được nhà tuyển dụng đánh dấu HOÀN THÀNH (COMPLETED)',
        400,
        'JOB_NOT_COMPLETED'
      );
    }

    if (application.status !== ApplicationStatus.ACCEPTED) {
      throw new AppError(
        'Chỉ có thể đánh giá cho những đơn ứng tuyển đã được duyệt nhận việc (ACCEPTED)',
        400,
        'APPLICATION_NOT_ACCEPTED'
      );
    }

    // 3. Determine reviewer & reviewee
    let reviewerId = userId;
    let revieweeId: string;
    let reviewerName: string;
    let roleText: string;

    if (userId === application.studentId) {
      // Student is reviewing Employer
      revieweeId = application.job.employerId;
      reviewerName = application.student.studentProfile?.fullName || 'Sinh viên';
      roleText = 'Sinh viên';
    } else if (userId === application.job.employerId) {
      // Employer is reviewing Student
      revieweeId = application.studentId;
      reviewerName = application.job.employer.employerProfile?.companyName || 'Nhà tuyển dụng';
      roleText = 'Nhà tuyển dụng';
    } else {
      throw new AppError(
        'Bạn không phải là người tham gia công việc này để có quyền đánh giá',
        403,
        'FORBIDDEN'
      );
    }

    // 4. Enforce BR5: Check if this user already reviewed this application
    const existingReview = await prisma.review.findUnique({
      where: {
        applicationId_reviewerId: {
          applicationId,
          reviewerId,
        },
      },
    });

    if (existingReview) {
      throw new AppError(
        'Bạn đã gửi đánh giá cho đơn ứng tuyển này rồi (Mỗi bên chỉ đánh giá 1 lần)',
        400,
        'REVIEW_ALREADY_EXISTS'
      );
    }

    // 5. Create review and notification in a transaction
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          applicationId,
          reviewerId,
          revieweeId,
          rating: data.rating,
          comment: data.comment?.trim() || null,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              role: true,
              studentProfile: { select: { fullName: true } },
              employerProfile: { select: { companyName: true } },
            },
          },
          reviewee: {
            select: {
              id: true,
              role: true,
              studentProfile: { select: { fullName: true } },
              employerProfile: { select: { companyName: true } },
            },
          },
        },
      });

      // BR9: Send in-app notification to the reviewee
      await tx.notification.create({
        data: {
          userId: revieweeId,
          type: 'NEW_REVIEW',
          title: 'Bạn nhận được một đánh giá mới',
          content: `${reviewerName} (${roleText}) đã đánh giá bạn ${data.rating} ⭐ cho công việc "${application.job.title}".${
            data.comment ? ` Nhận xét: "${data.comment.trim()}"` : ''
          }`,
          link: `/users/${revieweeId}`,
        },
      });

      return review;
    });
  }

  /**
   * Get public reviews & average rating score for a user (Student or Employer)
   */
  async getUserReviews(userId: string, query: GetReviewsQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        studentProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
    }

    // 2. Aggregate statistics: average rating and total count (non-hidden only)
    const [aggregate, distributionRaw, total, reviews] = await Promise.all([
      prisma.review.aggregate({
        where: { revieweeId: userId, isHidden: false },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { revieweeId: userId, isHidden: false },
        _count: { rating: true },
      }),
      prisma.review.count({
        where: { revieweeId: userId, isHidden: false },
      }),
      prisma.review.findMany({
        where: { revieweeId: userId, isHidden: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              role: true,
              studentProfile: {
                select: {
                  fullName: true,
                  university: true,
                  major: true,
                },
              },
              employerProfile: {
                select: {
                  companyName: true,
                  address: true,
                },
              },
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

    // Format rating distribution
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    distributionRaw.forEach((item) => {
      distribution[item.rating] = item._count.rating;
    });

    const averageRating = aggregate._avg.rating
      ? Math.round(aggregate._avg.rating * 10) / 10
      : 0;
    const totalReviews = aggregate._count.rating || 0;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        name:
          user.role === 'EMPLOYER'
            ? user.employerProfile?.companyName || 'Nhà tuyển dụng'
            : user.studentProfile?.fullName || 'Sinh viên',
        studentProfile: user.studentProfile,
        employerProfile: user.employerProfile,
      },
      summary: {
        averageRating,
        totalReviews,
        distribution,
      },
      reviews,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get reviews for a specific application
   */
  async getApplicationReviews(applicationId: string, userId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                role: true,
                studentProfile: { select: { fullName: true } },
                employerProfile: { select: { companyName: true } },
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError('Không tìm thấy đơn ứng tuyển', 404, 'APPLICATION_NOT_FOUND');
    }

    // Only student of app, job owner, or admin can view application review details
    if (application.studentId !== userId && application.job.employerId !== userId) {
      throw new AppError('Bạn không có quyền xem thông tin này', 403, 'FORBIDDEN');
    }

    const myReview = application.reviews.find((r) => r.reviewerId === userId) || null;
    const counterpartReview = application.reviews.find((r) => r.reviewerId !== userId) || null;

    return {
      applicationId,
      canReview:
        application.status === ApplicationStatus.ACCEPTED &&
        application.job.status === JobStatus.COMPLETED &&
        !myReview,
      myReview,
      counterpartReview,
      reviews: application.reviews,
    };
  }
}

export const reviewService = new ReviewService();
