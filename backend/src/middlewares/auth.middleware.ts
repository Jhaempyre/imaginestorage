import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Middleware to verify JWT token and authenticate user
 * Checks for token in cookies or Authorization header
 */
export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string };

    // Find user
    const user = await User.findById(decodedToken?.userId).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, 'Invalid access token');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(401, 'Account has been deactivated');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});

/**
 * Middleware to verify JWT token but don't throw error if not present
 * Used for optional authentication
 */
export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string };
      const user = await User.findById(decodedToken?.userId).select('-password -refreshToken');

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
});

/**
 * Middleware to check if user email is verified
 */
export const requireEmailVerification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser;

  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Email verification required');
  }

  next();
});

/**
 * Middleware to check user roles (for future use)
 * Currently not implemented as there's no role system
 */
export const requireRole = (roles: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;

    if (!user) {
      throw new ApiError(401, 'Authentication required');
    }

    // TODO: Implement role checking when role system is added
    // For now, just continue
    next();
  });
};

/**
 * Middleware to check if user owns the resource
 * Used for protecting user-specific resources
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const resourceUserId = req.params[userIdParam];

    if (!user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (user._id.toString() !== resourceUserId) {
      throw new ApiError(403, 'Access denied');
    }

    next();
  });
};

/**
 * Middleware to rate limit requests per user
 * Basic implementation - can be enhanced with Redis
 */
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitByUser = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;

    if (!user) {
      // Apply rate limiting to IP for unauthenticated requests
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `ip:${ip}`;
      
      const now = Date.now();
      const userLimit = userRequestCounts.get(key);

      if (!userLimit || now > userLimit.resetTime) {
        userRequestCounts.set(key, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (userLimit.count >= maxRequests) {
        throw new ApiError(429, 'Too many requests');
      }

      userLimit.count++;
      return next();
    }

    // Apply rate limiting to authenticated user
    const userId = user._id.toString();
    const now = Date.now();
    const userLimit = userRequestCounts.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequestCounts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      throw new ApiError(429, 'Too many requests');
    }

    userLimit.count++;
    next();
  });
};

/**
 * Middleware to log user activity
 */
export const logUserActivity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser;

  if (user) {
    // Log user activity - can be enhanced to store in database
    console.log(`User ${user.username} (${user._id}) accessed ${req.method} ${req.path} at ${new Date().toISOString()}`);
  }

  next();
});