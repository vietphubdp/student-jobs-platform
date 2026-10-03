import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  body: z
    .object({
      email: z.string().email('Email không đúng định dạng'),
      password: z.string().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
      role: z.enum([Role.STUDENT, Role.EMPLOYER], {
        errorMap: () => ({ message: 'Vai trò chỉ được là STUDENT hoặc EMPLOYER' }),
      }),
      // For student
      fullName: z.string().min(2, 'Họ và tên phải có tối thiểu 2 ký tự').optional(),
      university: z.string().optional(),
      major: z.string().optional(),
      // For employer
      companyName: z.string().min(2, 'Tên công ty/cơ sở phải có tối thiểu 2 ký tự').optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.role === Role.STUDENT && !data.fullName) {
          return false;
        }
        if (data.role === Role.EMPLOYER && !data.companyName) {
          return false;
        }
        return true;
      },
      {
        message: 'Sinh viên cần cung cấp họ tên, Nhà tuyển dụng cần cung cấp tên công ty/cơ sở',
        path: ['fullName'],
      }
    ),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
