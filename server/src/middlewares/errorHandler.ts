import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', details);
  }

  // Handle Custom AppError
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'FILE_TOO_LARGE', 'Dung lượng file vượt quá giới hạn cho phép (tối đa 5MB)');
    }
    return sendError(res, 400, 'UPLOAD_ERROR', `Lỗi tải lên file: ${err.message}`);
  }

  // Log unexpected errors in development
  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled Error:', err);
  }

  return sendError(
    res,
    500,
    'INTERNAL_SERVER_ERROR',
    'Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau.'
  );
};
