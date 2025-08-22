/**
 * Custom API Error class
 * Extends the built-in Error class with additional properties for API responses
 */
export class ApiError extends Error {
  public statusCode: number;
  public data: any;
  public success: boolean;
  public errors: string[];

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors: string[] = [],
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Helper function to create bad request error
 */
export const badRequestError = (message: string = 'Bad Request', errors: string[] = []) => {
  return new ApiError(400, message, errors);
};

/**
 * Helper function to create unauthorized error
 */
export const unauthorizedError = (message: string = 'Unauthorized') => {
  return new ApiError(401, message);
};

/**
 * Helper function to create forbidden error
 */
export const forbiddenError = (message: string = 'Forbidden') => {
  return new ApiError(403, message);
};

/**
 * Helper function to create not found error
 */
export const notFoundError = (message: string = 'Not Found') => {
  return new ApiError(404, message);
};

/**
 * Helper function to create conflict error
 */
export const conflictError = (message: string = 'Conflict') => {
  return new ApiError(409, message);
};

/**
 * Helper function to create validation error
 */
export const validationError = (message: string = 'Validation Error', errors: string[] = []) => {
  return new ApiError(422, message, errors);
};

/**
 * Helper function to create internal server error
 */
export const internalServerError = (message: string = 'Internal Server Error') => {
  return new ApiError(500, message);
};