import { Request, Response } from 'express';
import { User, IUser } from '../models/user';
import { File } from '../models/file';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import mongoose from 'mongoose';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  // Get user with file statistics
  const userProfile = await User.aggregate([
    { $match: { _id: user._id } },
    {
      $lookup: {
        from: 'files',
        localField: '_id',
        foreignField: 'userId',
        as: 'files',
        pipeline: [
          { $match: { isDeleted: false } }
        ]
      }
    },
    {
      $addFields: {
        filesCount: { $size: '$files' },
        totalStorageUsed: { $sum: '$files.fileSize' }
      }
    },
    {
      $project: {
        files: 0,
        password: 0,
        emailVerificationToken: 0,
        passwordResetToken: 0,
        passwordResetExpires: 0,
        refreshToken: 0
      }
    }
  ]);

  if (!userProfile.length) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(200, userProfile[0], 'User profile fetched successfully')
  );
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { firstName, lastName, username } = req.body;

  // Validate input
  const updateData: Partial<IUser> = {};

  if (firstName !== undefined) {
    if (firstName.length > 50) {
      throw new ApiError(400, 'First name cannot exceed 50 characters');
    }
    updateData.firstName = firstName.trim();
  }

  if (lastName !== undefined) {
    if (lastName.length > 50) {
      throw new ApiError(400, 'Last name cannot exceed 50 characters');
    }
    updateData.lastName = lastName.trim();
  }

  if (username !== undefined) {
    if (username.length < 3 || username.length > 30) {
      throw new ApiError(400, 'Username must be between 3 and 30 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new ApiError(400, 'Username can only contain letters, numbers, and underscores');
    }

    // Check if username is already taken
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: user._id }
    });

    if (existingUser) {
      throw new ApiError(409, 'Username is already taken');
    }

    updateData.username = username.toLowerCase();
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -refreshToken');

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(200, updatedUser, 'Profile updated successfully')
  );
});

/**
 * @desc    Update user avatar
 * @route   PUT /api/users/avatar
 * @access  Private
 */
export const updateUserAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { avatar } = req.body;

  if (!avatar) {
    throw new ApiError(400, 'Avatar URL is required');
  }

  // Update avatar
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { avatar },
    { new: true }
  ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -refreshToken');

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(200, updatedUser, 'Avatar updated successfully')
  );
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
export const deleteUserAccount = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, 'Password is required to delete account');
  }

  // Get user with password
  const userWithPassword = await User.findById(user._id).select('+password');

  if (!userWithPassword) {
    throw new ApiError(404, 'User not found');
  }

  // Verify password
  const isPasswordValid = userWithPassword.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(400, 'Invalid password');
  }

  // Start transaction for account deletion
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Soft delete all user files
    await File.updateMany(
      { userId: user._id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { session }
    );

    // Deactivate user account
    await User.findByIdAndUpdate(
      user._id,
      { 
        isActive: false,
        refreshToken: undefined,
        emailVerificationToken: undefined,
        passwordResetToken: undefined,
        passwordResetExpires: undefined
      },
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json(
      new ApiResponse(200, {}, 'Account deleted successfully')
    );
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(500, 'Failed to delete account');
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private
 */
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  const stats = await File.aggregate([
    { $match: { userId: user._id, isDeleted: false } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        avgFileSize: { $avg: '$fileSize' },
        totalDownloads: { $sum: '$downloadCount' }
      }
    },
    {
      $addFields: {
        totalSizeMB: { $round: [{ $divide: ['$totalSize', 1024 * 1024] }, 2] },
        avgFileSizeMB: { $round: [{ $divide: ['$avgFileSize', 1024 * 1024] }, 2] }
      }
    }
  ]);

  // Get file type distribution
  const fileTypes = await File.aggregate([
    { $match: { userId: user._id, isDeleted: false } },
    {
      $group: {
        _id: '$mimeType',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' }
      }
    },
    {
      $addFields: {
        totalSizeMB: { $round: [{ $divide: ['$totalSize', 1024 * 1024] }, 2] }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity = await File.aggregate([
    {
      $match: {
        userId: user._id,
        isDeleted: false,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        uploads: { $sum: 1 },
        totalSize: { $sum: '$fileSize' }
      }
    },
    {
      $addFields: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        totalSizeMB: { $round: [{ $divide: ['$totalSize', 1024 * 1024] }, 2] }
      }
    },
    { $sort: { date: 1 } },
    { $project: { _id: 0 } }
  ]);

  const result = {
    overview: stats[0] || {
      totalFiles: 0,
      totalSize: 0,
      totalSizeMB: 0,
      avgFileSize: 0,
      avgFileSizeMB: 0,
      totalDownloads: 0
    },
    fileTypes,
    recentActivity
  };

  return res.status(200).json(
    new ApiResponse(200, result, 'User statistics fetched successfully')
  );
});

/**
 * @desc    Get user files
 * @route   GET /api/users/files
 * @access  Private
 */
export const getUserFiles = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search,
    mimeType,
    tags
  } = req.query;

  // Build query
  const query: any = {
    userId: user._id,
    isDeleted: false
  };

  // Add search filter
  if (search) {
    query.$text = { $search: search as string };
  }

  // Add MIME type filter
  if (mimeType) {
    query.mimeType = { $regex: mimeType as string, $options: 'i' };
  }

  // Add tags filter
  if (tags) {
    const tagArray = (tags as string).split(',').map(tag => tag.trim());
    query.tags = { $in: tagArray };
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Get files with pagination
  const files = await File.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  // Get total count for pagination
  const totalFiles = await File.countDocuments(query);
  const totalPages = Math.ceil(totalFiles / limitNum);

  const result = {
    files,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalFiles,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    }
  };

  return res.status(200).json(
    new ApiResponse(200, result, 'User files fetched successfully')
  );
});

/**
 * @desc    Search users (Admin only - for future use)
 * @route   GET /api/users/search
 * @access  Private (Admin)
 */
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    isActive,
    isEmailVerified
  } = req.query;

  // Build query
  const query: any = {};

  if (search) {
    query.$or = [
      { username: { $regex: search as string, $options: 'i' } },
      { email: { $regex: search as string, $options: 'i' } },
      { firstName: { $regex: search as string, $options: 'i' } },
      { lastName: { $regex: search as string, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (isEmailVerified !== undefined) {
    query.isEmailVerified = isEmailVerified === 'true';
  }

  // Calculate pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Get users with pagination
  const users = await User.find(query)
    .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -refreshToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limitNum);

  const result = {
    users,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalUsers,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    }
  };

  return res.status(200).json(
    new ApiResponse(200, result, 'Users fetched successfully')
  );
});