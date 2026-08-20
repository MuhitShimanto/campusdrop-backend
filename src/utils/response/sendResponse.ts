import type { Response } from 'express';

type ApiResponse<T> = {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: unknown;
};

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  status: ApiResponse<T>['status'],
  message: string,
  data?: T,
  error?: unknown,
) => {
  return res.status(statusCode).json({
    status,
    message,
    ...(status === 'success' && { data }),
    ...(status === 'error' &&
      process.env.NODE_ENV === 'development' && { error }),
  });
};
