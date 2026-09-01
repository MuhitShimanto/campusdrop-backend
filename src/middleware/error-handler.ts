import type { ErrorRequestHandler } from 'express';

import { AppError } from '../utils/errors/app-error.js';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.issues.map((issue) => ({
          path: issue.path.length > 0 ? issue.path.join('.') : null,
          message: issue.message,
        })),
      },
    });

    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });

    return;
  }
  console.error(error);

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: `${error.message || 'An unexpected error occurred'}`,
    },
  });
};
