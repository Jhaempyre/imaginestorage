import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  deleteUserAccount,
  getUserStats,
  getUserFiles,
  searchUsers
} from '../controllers/user.controller';
import {
  verifyJWT,
  requireEmailVerification,
  rateLimitByUser,
  validateRequest
} from '../middlewares';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile with statistics
 * @access  Private
 */
router.get('/profile', verifyJWT, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 * @body    { firstName?, lastName?, username? }
 */
router.put(
  '/profile',
  verifyJWT,
  requireEmailVerification,
  updateUserProfile
);

/**
 * @route   PUT /api/users/avatar
 * @desc    Update user avatar
 * @access  Private
 * @body    { avatar }
 */
router.put(
  '/avatar',
  verifyJWT,
  requireEmailVerification,
  validateRequest(['avatar']),
  updateUserAvatar
);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 * @body    { password }
 */
router.delete(
  '/account',
  verifyJWT,
  validateRequest(['password']),
  deleteUserAccount
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics and analytics
 * @access  Private
 */
router.get('/stats', verifyJWT, getUserStats);

/**
 * @route   GET /api/users/files
 * @desc    Get user files with pagination and filtering
 * @access  Private
 * @query   { page?, limit?, sortBy?, sortOrder?, search?, mimeType?, tags? }
 */
router.get('/files', verifyJWT, getUserFiles);

/**
 * @route   GET /api/users/search
 * @desc    Search users (Admin functionality)
 * @access  Private (Admin only - for future use)
 * @query   { page?, limit?, search?, isActive?, isEmailVerified? }
 */
router.get(
  '/search',
  verifyJWT,
  requireEmailVerification,
  rateLimitByUser(50, 60 * 60 * 1000), // 50 searches per hour
  searchUsers
);

export default router;