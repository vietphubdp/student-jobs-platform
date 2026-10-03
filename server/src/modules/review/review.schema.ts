import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z
      .number({
        required_error: 'Số sao đánh giá là bắt buộc',
        invalid_type_error: 'Số sao phải là một số nguyên',
      })
      .int('Số sao phải là số nguyên')
      .min(1, 'Số sao tối thiểu là 1')
      .max(5, 'Số sao tối đa là 5'),
    comment: z
      .string()
      .max(1000, 'Nội dung nhận xét tối đa 1000 ký tự')
      .optional()
      .nullable(),
  }),
});

export const getReviewsQuerySchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    })
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type GetReviewsQueryInput = {
  page?: number;
  limit?: number;
};
