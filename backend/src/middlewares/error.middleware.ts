import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import mongoose from 'mongoose';

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate responses
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // If error is not an instance of ApiError, create one
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, [], err?.stack);
  }

  // Handle specific error types
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new ApiError(400, message);
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new ApiError(409, message);
  }

  if (err.name === 'ValidationError') {
    // Mongoose validation error
    const errors = Object.values(err.errors).map((val: any) => val.message);
    const message = 'Validation Error';
    error = new ApiError(400, message, errors);
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ApiError(401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ApiError(401, message);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      errors: error.errors
    });
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * Middleware to handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Middleware to validate request body
 */
export const validateRequest = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      const error = new ApiError(
        400,
        'Missing required fields',
        missingFields.map(field => `${field} is required`)
      );
      return next(error);
    }

    next();
  };
};