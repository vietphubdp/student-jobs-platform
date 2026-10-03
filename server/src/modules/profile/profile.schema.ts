import { z } from 'zod';

export const updateStudentProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Họ và tên phải có tối thiểu 2 ký tự').optional(),
    phone: z.string().optional().nullable(),
    university: z.string().optional().nullable(),
    major: z.string().optional().nullable(),
    bio: z.string().max(1000, 'Giới thiệu tối đa 1000 ký tự').optional().nullable(),
    skills: z.array(z.string()).optional(),
    cvUrl: z.string().optional().nullable(),
  }),
});

export const updateEmployerProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(2, 'Tên công ty/cơ sở phải có tối thiểu 2 ký tự').optional(),
    description: z.string().max(2000, 'Mô tả tối đa 2000 ký tự').optional().nullable(),
    address: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().url('Website phải là đường dẫn URL hợp lệ').optional().nullable().or(z.literal('')),
  }),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>['body'];
export type UpdateEmployerProfileInput = z.infer<typeof updateEmployerProfileSchema>['body'];
