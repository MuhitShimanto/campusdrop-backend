import type { RequestHandler } from 'express';
import { RouteNotFoundError } from '../utils/errors/route-not-found-error.js';

export const routeNotFoundHandler: RequestHandler = (
  req,
  _res,
  next,
) => {
  next(
    new RouteNotFoundError(
      req.method,
      req.originalUrl,
    ),
  );
};
