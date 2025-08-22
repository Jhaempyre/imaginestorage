import { Request, Response, NextFunction } from 'express';

/**
 * Higher-order function to handle async operations in Express route handlers
 * Automatically catches errors and passes them to the error handling middleware
 * 
 * @param requestHandler - The async function to wrap
 * @returns Express middleware function
 */
export const asyncHandler = (requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

/**
 * Alternative implementation using try-catch
 * Can be used for more explicit error handling
 */
export const asyncHandlerTryCatch = (requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};