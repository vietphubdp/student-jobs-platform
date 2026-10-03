import { z } from 'zod';
import { JobStatus, SalaryUnit } from '@prisma/client';

export const createJobSchema = z.object({
  body: z
    .object({
      title: z.string().min(3, 'Tiêu đề công việc phải có ít nhất 3 ký tự'),
      description: z.string().min(10, 'Mô tả công việc phải có ít nhất 10 ký tự'),
      categoryId: z.string().min(1, 'Vui lòng chọn ngành nghề công việc'),
      workTime: z.string().min(2, 'Vui lòng nhập thời gian làm việc (ví dụ: Ca 4h/ngày)'),
      salaryMin: z.number().int().min(0, 'Mức lương tối thiểu không được âm'),
      salaryMax: z.number().int().min(0, 'Mức lương tối đa không được âm').optional().nullable(),
      salaryUnit: z.enum([SalaryUnit.HOUR, SalaryUnit.DAY, SalaryUnit.MONTH, SalaryUnit.JOB], {
        errorMap: () => ({ message: 'Đơn vị lương chỉ được là HOUR, DAY, MONTH hoặc JOB' }),
      }),
      location: z.string().min(2, 'Vui lòng nhập địa chỉ làm việc cụ thể'),
      city: z.string().min(2, 'Vui lòng nhập Tỉnh/Thành phố'),
      slots: z.number().int().min(1, 'Số lượng cần tuyển tối thiểu là 1').default(1),
      deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Hạn nộp hồ sơ không đúng định dạng ngày tháng hợp lệ',
      }),
      status: z.enum([JobStatus.DRAFT, JobStatus.OPEN]).default(JobStatus.OPEN),
    })
    .refine(
      (data) => {
        if (data.salaryMax !== undefined && data.salaryMax !== null) {
          return data.salaryMax >= data.salaryMin;
        }
        return true;
      },
      {
        message: 'Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu',
        path: ['salaryMax'],
      }
    ),
});

export const updateJobSchema = z.object({
  body: z
    .object({
      title: z.string().min(3, 'Tiêu đề công việc phải có ít nhất 3 ký tự').optional(),
      description: z.string().min(10, 'Mô tả công việc phải có ít nhất 10 ký tự').optional(),
      categoryId: z.string().min(1, 'Vui lòng chọn ngành nghề công việc').optional(),
      workTime: z.string().min(2, 'Vui lòng nhập thời gian làm việc').optional(),
      salaryMin: z.number().int().min(0).optional(),
      salaryMax: z.number().int().min(0).optional().nullable(),
      salaryUnit: z.enum([SalaryUnit.HOUR, SalaryUnit.DAY, SalaryUnit.MONTH, SalaryUnit.JOB]).optional(),
      location: z.string().min(2).optional(),
      city: z.string().min(2).optional(),
      slots: z.number().int().min(1).optional(),
      deadline: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Hạn nộp hồ sơ không đúng định dạng ngày tháng hợp lệ',
        })
        .optional(),
      status: z.enum([JobStatus.DRAFT, JobStatus.OPEN, JobStatus.FILLED, JobStatus.COMPLETED, JobStatus.CLOSED]).optional(),
    })
    .refine(
      (data) => {
        if (
          data.salaryMin !== undefined &&
          data.salaryMax !== undefined &&
          data.salaryMax !== null
        ) {
          return data.salaryMax >= data.salaryMin;
        }
        return true;
      },
      {
        message: 'Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu',
        path: ['salaryMax'],
      }
    ),
});

export const changeJobStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      JobStatus.DRAFT,
      JobStatus.OPEN,
      JobStatus.FILLED,
      JobStatus.COMPLETED,
      JobStatus.CLOSED,
    ], {
      errorMap: () => ({ message: 'Trạng thái công việc không hợp lệ' }),
    }),
  }),
});

export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type UpdateJobInput = z.infer<typeof updateJobSchema>['body'];
export type ChangeJobStatusInput = z.infer<typeof changeJobStatusSchema>['body'];
