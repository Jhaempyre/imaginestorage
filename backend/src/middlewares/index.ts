// Authentication Middleware
export {
  verifyJWT,
  optionalAuth,
  requireEmailVerification,
  requireRole,
  requireOwnership,
  rateLimitByUser,
  logUserActivity
} from './auth.middleware';

// Error Handling Middleware
export {
  errorHandler,
  notFoundHandler,
  validateRequest
} from './error.middleware';