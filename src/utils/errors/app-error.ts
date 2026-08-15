export interface AppErrorOptions {
  cause?: unknown;
}

export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  readonly isOperational = true;

  constructor(
    message: string,
    options?: AppErrorOptions,
  ) {
    super(message, options);

    this.name = this.constructor.name;

    Error.captureStackTrace?.(
      this,
      this.constructor,
    );
  }
}