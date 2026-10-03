import { Response } from 'express';

export interface MetaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuccessResponse<T> {
  data: T;
  meta?: {
    pagination?: MetaPagination;
    [key: string]: any;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: Record<string, any>
): Response => {
  const responsePayload: SuccessResponse<T> = { data };
  if (meta) {
    responsePayload.meta = meta;
  }
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any
): Response => {
  const responsePayload: ErrorResponse = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(responsePayload);
};
