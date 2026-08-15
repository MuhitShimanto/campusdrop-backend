import { RequestHandler } from 'express';
import { z } from 'zod';

declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedParams?: unknown;
      validatedQuery?: unknown;
    }
  }
}

export const validateBody = <T extends z.ZodType>(
  schema: T,
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(result.error);
    }

    req.validatedBody = result.data;

    next();
  };
};

export const validateParams = <T extends z.ZodType>(
  schema: T,
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return next(result.error);
    }

    req.validatedParams = result.data;

    next();
  };
};

export const validateQuery = <T extends z.ZodType>(
  schema: T,
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(result.error);
    }

    req.validatedQuery = result.data;

    next();
  };
};
