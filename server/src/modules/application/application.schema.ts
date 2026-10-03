import { z } from 'zod';

export const createApplicationSchema = z.object({
  body: z.object({
    coverLetter: z
      .string()
      .max(2000, 'Thư giới thiệu không được vượt quá 2000 ký tự')
      .optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'REJECTED'], {
      errorMap: () => ({ message: 'Trạng thái phải là ACCEPTED hoặc REJECTED' }),
    }),
    reason: z
      .string()
      .max(500, 'Lý do không được vượt quá 500 ký tự')
      .optional(),
  }),
});

export const withdrawApplicationSchema = z.object({
  body: z
    .object({
      reason: z
        .string()
        .max(500, 'Lý do rút đơn không được vượt quá 500 ký tự')
        .optional(),
    })
    .optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>['body'];
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>['body'];
export type WithdrawApplicationInput = z.infer<typeof withdrawApplicationSchema>['body'];
