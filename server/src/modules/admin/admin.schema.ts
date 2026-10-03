import { z } from 'zod';
import { Role, UserStatus, JobStatus } from '@prisma/client';

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.PENDING, UserStatus.BANNED], {
      errorMap: () => ({ message: 'Trạng thái người dùng phải là ACTIVE, PENDING hoặc BANNED' }),
    }),
  }),
});

export const toggleHideSchema = z.object({
  body: z
    .object({
      isHidden: z.boolean().optional(),
    })
    .optional(),
});

export const getAdminUsersQuerySchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
      role: z.enum([Role.STUDENT, Role.EMPLOYER, Role.ADMIN]).optional(),
      status: z.enum([UserStatus.ACTIVE, UserStatus.PENDING, UserStatus.BANNED]).optional(),
      q: z.string().optional(),
    })
    .optional(),
});

export const getAdminJobsQuerySchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
      status: z.enum([JobStatus.DRAFT, JobStatus.OPEN, JobStatus.FILLED, JobStatus.COMPLETED, JobStatus.CLOSED]).optional(),
      isHidden: z.enum(['true', 'false']).optional(),
      categoryId: z.string().optional(),
      q: z.string().optional(),
    })
    .optional(),
});

export const getAdminReviewsQuerySchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
      isHidden: z.enum(['true', 'false']).optional(),
      rating: z.coerce.number().int().min(1).max(5).optional(),
    })
    .optional(),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];
export type ToggleHideInput = z.infer<typeof toggleHideSchema>['body'];
export type GetAdminUsersQuery = {
  page?: number;
  limit?: number;
  role?: Role;
  status?: UserStatus;
  q?: string;
};
export type GetAdminJobsQuery = {
  page?: number;
  limit?: number;
  status?: JobStatus;
  isHidden?: boolean;
  categoryId?: string;
  q?: string;
};
export type GetAdminReviewsQuery = {
  page?: number;
  limit?: number;
  isHidden?: boolean;
  rating?: number;
};
