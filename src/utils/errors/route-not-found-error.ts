import { AppError } from './app-error.js';

export class RouteNotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'ROUTE_NOT_FOUND';

  constructor(method: string, path: string) {
    super(`Route ${method} ${path} not found`);
  }
}