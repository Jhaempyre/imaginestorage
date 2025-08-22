import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser
} from '../controllers/auth.controller';
import {
  verifyJWT,
  requireEmailVerification,
  rateLimitByUser,
  validateRequest
} from '../middlewares';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { username, email, password, firstName?, lastName? }
 */
router.post(
  '/register',
  rateLimitByUser(10, 15 * 60 * 1000), // 10 requests per 15 minutes
  validateRequest(['username', 'email', 'password']),
  registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email?, username?, password }
 */
router.post(
  '/login',
  rateLimitByUser(5, 15 * 60 * 1000), // 5 login attempts per 15 minutes
  validateRequest(['password']),
  loginUser
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', verifyJWT, logoutUser);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post('/refresh-token', refreshAccessToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyJWT, getCurrentUser);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email
 * @access  Public
 * @body    { token }
 */
router.post(
  '/verify-email',
  validateRequest(['token']),
  verifyEmail
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 * @body    { email }
 */
router.post(
  '/resend-verification',
  rateLimitByUser(3, 60 * 60 * 1000), // 3 requests per hour
  validateRequest(['email']),
  resendEmailVerification
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 * @body    { email }
 */
router.post(
  '/forgot-password',
  rateLimitByUser(3, 60 * 60 * 1000), // 3 requests per hour
  validateRequest(['email']),
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @body    { token, newPassword }
 */
router.post(
  '/reset-password',
  validateRequest(['token', 'newPassword']),
  resetPassword
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 * @body    { oldPassword, newPassword }
 */
router.post(
  '/change-password',
  verifyJWT,
  requireEmailVerification,
  validateRequest(['oldPassword', 'newPassword']),
  changePassword
);

export default router;