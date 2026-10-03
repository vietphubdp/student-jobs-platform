import { ApplicationStatus, JobStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { canApplicationTransition } from './application.state-machine';
import { CreateApplicationInput } from './application.schema';
import { getPaginationMeta } from '../../utils/pagination';

export class ApplicationService {
  /**
   * Apply for a job (Student only)
   * Enforces: BR1 (Unique application), BR2 (Job must be OPEN, deadline > now, not hidden),
   * Cannot apply to own job, BR9 (In-app notification to Employer).
   */
  async applyJob(studentId: string, jobId: string, data: CreateApplicationInput) {
    // 1. Check Student Profile
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new AppError('Chỉ tài khoản Sinh viên mới có thể nộp đơn ứng tuyển', 403, 'FORBIDDEN');
    }

    if (!student.studentProfile) {
      throw new AppError('Vui lòng cập nhật Hồ sơ cá nhân trước khi ứng tuyển', 400, 'PROFILE_REQUIRED');
    }

    // 2. Check Job details & business rules
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          include: { employerProfile: true },
        },
      },
    });

    if (!job || job.isHidden) {
      throw new AppError('Công việc không tồn tại hoặc đã bị ẩn', 404, 'JOB_NOT_FOUND');
    }

    if (job.employerId === studentId) {
      throw new AppError('Nhà tuyển dụng không thể ứng tuyển vào công việc của chính mình', 400, 'CANNOT_APPLY_OWN_JOB');
    }

    if (job.status !== JobStatus.OPEN) {
      throw new AppError(
        job.status === JobStatus.FILLED
          ? 'Công việc này đã nhận đủ số lượng ứng viên'
          : 'Công việc này hiện không mở nhận hồ sơ ứng tuyển',
        400,
        'JOB_NOT_OPEN'
      );
    }

    if (new Date(job.deadline) < new Date()) {
      throw new AppError('Đã quá thời hạn nộp hồ sơ ứng tuyển cho công việc này', 400, 'DEADLINE_PASSED');
    }

    // 3. BR1: Check duplicate application
    const existingApp = await prisma.application.findUnique({
      where: {
        jobId_studentId: {
          jobId,
          studentId,
        },
      },
    });

    if (existingApp) {
      throw new AppError('Bạn đã nộp đơn ứng tuyển cho công việc này rồi (Mỗi SV chỉ nộp 1 đơn/job)', 400, 'DUPLICATE_APPLICATION');
    }

    // 4. Create application & notify employer in transaction
    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          jobId,
          studentId,
          coverLetter: data.coverLetter?.trim() || null,
          cvUrl: student.studentProfile?.cvUrl || null,
          status: ApplicationStatus.PENDING,
        },
        include: {
          job: {
            include: {
              category: true,
              employer: {
                include: { employerProfile: true },
              },
            },
          },
        },
      });

      // BR9: In-app notification for Employer
      const applicantName = student.studentProfile?.fullName || 'Một sinh viên';
      await tx.notification.create({
        data: {
          userId: job.employerId,
          type: 'APPLICATION_RECEIVED',
          title: 'Có ứng viên mới nộp đơn',
          content: `${applicantName} đã nộp đơn ứng tuyển vào vị trí "${job.title}".`,
          link: `/employer/jobs/${job.id}/applications`,
        },
      });

      return created;
    });

    return application;
  }

  /**
   * Get applications submitted by student
   */
  async getStudentApplications(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    status?: ApplicationStatus
  ) {
    const skip = (page - 1) * limit;
    const where: any = { studentId };
    if (status) {
      where.status = status;
    }

    const [total, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            include: {
              category: true,
              employer: {
                include: { employerProfile: true },
              },
            },
          },
          reviews: true,
        },
      }),
    ]);

    return {
      applications,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  /**
   * Withdraw an application (Student only)
   */
  async withdrawApplication(studentId: string, applicationId: string, reason?: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      },
    });

    if (!application || application.studentId !== studentId) {
      throw new AppError('Không tìm thấy đơn ứng tuyển của bạn', 404, 'APPLICATION_NOT_FOUND');
    }

    if (!canApplicationTransition(application.status, ApplicationStatus.WITHDRAWN)) {
      throw new AppError(
        `Không thể rút đơn khi đang ở trạng thái "${application.status}"`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    if (application.status === ApplicationStatus.ACCEPTED && application.job.status === JobStatus.COMPLETED) {
      throw new AppError('Không thể rút đơn khi công việc đã hoàn thành', 400, 'JOB_ALREADY_COMPLETED');
    }

    const wasAccepted = application.status === ApplicationStatus.ACCEPTED;

    return prisma.$transaction(async (tx) => {
      // 1. Update application status
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.WITHDRAWN,
          rejectReason: reason?.trim() ? `Lý do rút: ${reason.trim()}` : 'Sinh viên đã rút đơn',
        },
      });

      // 2. If previously accepted, check if job should revert from FILLED to OPEN
      if (wasAccepted) {
        const remainingAccepted = await tx.application.count({
          where: {
            jobId: application.jobId,
            status: ApplicationStatus.ACCEPTED,
          },
        });

        if (remainingAccepted < application.job.slots && application.job.status === JobStatus.FILLED) {
          await tx.job.update({
            where: { id: application.jobId },
            data: { status: JobStatus.OPEN },
          });
        }
      }

      // 3. BR9: Create in-app notification for Employer
      const student = await tx.studentProfile.findUnique({
        where: { userId: studentId },
      });
      const applicantName = student?.fullName || 'Ứng viên';

      await tx.notification.create({
        data: {
          userId: application.job.employerId,
          type: 'APPLICATION_WITHDRAWN',
          title: 'Ứng viên đã rút đơn',
          content: `${applicantName} đã rút đơn ứng tuyển công việc "${application.job.title}".${
            reason ? ` Lý do: ${reason}` : ''
          }`,
          link: `/employer/jobs/${application.jobId}/applications`,
        },
      });

      return updated;
    });
  }

  /**
   * Get applications for a specific job (Employer only, BR3)
   */
  async getJobApplications(
    employerId: string,
    jobId: string,
    page: number = 1,
    limit: number = 10,
    status?: ApplicationStatus
  ) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { category: true },
    });

    if (!job) {
      throw new AppError('Công việc không tồn tại', 404, 'JOB_NOT_FOUND');
    }

    // BR3: Only job owner can view applicants
    if (job.employerId !== employerId) {
      throw new AppError('Bạn không có quyền xem ứng viên của công việc này', 403, 'FORBIDDEN');
    }

    const where: any = { jobId };
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [
      total,
      applications,
      pendingCount,
      acceptedCount,
      rejectedCount,
      withdrawnCount,
    ] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              email: true,
              studentProfile: true,
            },
          },
          reviews: true,
        },
      }),
      prisma.application.count({ where: { jobId, status: ApplicationStatus.PENDING } }),
      prisma.application.count({ where: { jobId, status: ApplicationStatus.ACCEPTED } }),
      prisma.application.count({ where: { jobId, status: ApplicationStatus.REJECTED } }),
      prisma.application.count({ where: { jobId, status: ApplicationStatus.WITHDRAWN } }),
    ]);

    return {
      job: {
        id: job.id,
        title: job.title,
        slots: job.slots,
        status: job.status,
        deadline: job.deadline,
        category: job.category,
      },
      summary: {
        slots: job.slots,
        totalApplications: total,
        pendingCount,
        acceptedCount,
        rejectedCount,
        withdrawnCount,
        isFull: acceptedCount >= job.slots,
      },
      applications,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  /**
   * Update Application status (Accept / Reject candidate)
   * Uses Prisma Transaction + Row Lock (SELECT ... FOR UPDATE) to prevent race condition.
   * Auto transitions Job to FILLED when accepted count reaches slots.
   * Reverts Job to OPEN if an accepted candidate is rejected.
   * Enforces BR3 (Job owner only) and BR9 (Notification to Student).
   */
  async updateApplicationStatus(
    employerId: string,
    applicationId: string,
    newStatus: 'ACCEPTED' | 'REJECTED',
    reason?: string
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch application
      const application = await tx.application.findUnique({
        where: { id: applicationId },
        include: {
          job: true,
          student: {
            include: { studentProfile: true },
          },
        },
      });

      if (!application) {
        throw new AppError('Không tìm thấy đơn ứng tuyển', 404, 'APPLICATION_NOT_FOUND');
      }

      // 2. BR3: Verify ownership
      if (application.job.employerId !== employerId) {
        throw new AppError('Bạn không có quyền duyệt ứng viên cho công việc này', 403, 'FORBIDDEN');
      }

      // 3. Row lock on Job to prevent concurrent over-acceptance beyond slots
      const lockedJobs: Array<{
        id: string;
        slots: number;
        status: JobStatus;
        employer_id: string;
        title: string;
      }> = await tx.$queryRaw`
        SELECT id, slots, status, employer_id, title 
        FROM jobs 
        WHERE id = ${application.jobId} 
        FOR UPDATE
      `;

      if (!lockedJobs || lockedJobs.length === 0) {
        throw new AppError('Không thể khóa dữ liệu công việc để xử lý', 500, 'LOCK_FAILED');
      }

      const lockedJob = lockedJobs[0];

      // 4. Check state transition
      const targetStatus =
        newStatus === 'ACCEPTED' ? ApplicationStatus.ACCEPTED : ApplicationStatus.REJECTED;

      if (!canApplicationTransition(application.status, targetStatus)) {
        throw new AppError(
          `Không thể chuyển đơn từ trạng thái "${application.status}" sang "${targetStatus}"`,
          400,
          'INVALID_STATE_TRANSITION'
        );
      }

      const wasAccepted = application.status === ApplicationStatus.ACCEPTED;

      // 5. Handling ACCEPTED transition
      if (targetStatus === ApplicationStatus.ACCEPTED) {
        // Count current accepted applications
        const currentAccepted = await tx.application.count({
          where: {
            jobId: application.jobId,
            status: ApplicationStatus.ACCEPTED,
          },
        });

        if (currentAccepted >= lockedJob.slots) {
          throw new AppError(
            `Công việc đã nhận đủ số lượng ứng viên (${lockedJob.slots} người). Không thể chấp nhận thêm.`,
            400,
            'JOB_SLOTS_FULL'
          );
        }

        // Update application
        const updatedApp = await tx.application.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.ACCEPTED,
            rejectReason: null,
          },
        });

        // If newly reached slots limit, auto transition Job status to FILLED
        if (currentAccepted + 1 >= lockedJob.slots) {
          await tx.job.update({
            where: { id: application.jobId },
            data: { status: JobStatus.FILLED },
          });
        }

        // BR9: Notification for Student
        await tx.notification.create({
          data: {
            userId: application.studentId,
            type: 'APPLICATION_ACCEPTED',
            title: 'Đơn ứng tuyển đã được Chấp nhận! 🎉',
            content: `Chúc mừng! Nhà tuyển dụng đã đồng ý nhận bạn vào công việc "${lockedJob.title}".`,
            link: '/student/applications',
          },
        });

        return updatedApp;
      }

      // 6. Handling REJECTED transition
      if (targetStatus === ApplicationStatus.REJECTED) {
        const updatedApp = await tx.application.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.REJECTED,
            rejectReason: reason?.trim() || null,
          },
        });

        // If we rejected an application that was previously ACCEPTED,
        // check if accepted count dropped below slots and job was FILLED -> revert to OPEN
        if (wasAccepted) {
          const remainingAccepted = await tx.application.count({
            where: {
              jobId: application.jobId,
              status: ApplicationStatus.ACCEPTED,
            },
          });

          if (remainingAccepted < lockedJob.slots && lockedJob.status === JobStatus.FILLED) {
            await tx.job.update({
              where: { id: application.jobId },
              data: { status: JobStatus.OPEN },
            });
          }
        }

        // BR9: Notification for Student
        await tx.notification.create({
          data: {
            userId: application.studentId,
            type: 'APPLICATION_REJECTED',
            title: 'Kết quả xét duyệt đơn ứng tuyển',
            content: `Đơn ứng tuyển của bạn cho vị trí "${lockedJob.title}" đã bị từ chối.${
              reason?.trim() ? ` Lý do: ${reason.trim()}` : ''
            }`,
            link: '/student/applications',
          },
        });

        return updatedApp;
      }

      throw new AppError('Trạng thái không hợp lệ', 400, 'INVALID_STATUS');
    });
  }
}

export const applicationService = new ApplicationService();
