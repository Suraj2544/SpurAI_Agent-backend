export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  readonly code: string;

  constructor(message: string, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  constructor(message: string, code = 'BAD_REQUEST') {
    super(message, code);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  constructor(message: string, code = 'NOT_FOUND') {
    super(message, code);
  }
}
