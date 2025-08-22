import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { IUser, User } from '../models/user';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// JWT Token generation
const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY! || '15m' as any }
  );
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' as any }
  );
};

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating tokens');
  }
};

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Validation
  if (!username || !email || !password) {
    throw new ApiError(400, 'Username, email, and password are required');
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    firstName,
    lastName
  });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Remove password from response
  const createdUser = await User.findById(user._id).select('-password -emailVerificationToken');

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering user');
  }

  // TODO: Send verification email
  console.log(`Email verification token for ${email}: ${verificationToken}`);

  return res.status(201).json(
    new ApiResponse(201, createdUser, 'User registered successfully. Please verify your email.')
  );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  // Validation
  if ((!username && !email) || !password) {
    throw new ApiError(400, 'Username or email and password are required');
  }

  // Find user
  const user = await User.findOne({
    $or: [{ username }, { email }]
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(401, 'Account has been deactivated');
  }

  // Verify password
  const isPasswordValid = user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString());

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Remove sensitive data from response
  const loggedInUser = await User.findById(user._id).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken
      }, 'User logged in successfully')
    );
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  // Remove refresh token from database
  await User.findByIdAndUpdate(
    user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { userId: string };

    const user = await User.findById(decodedToken?.userId);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id.toString());

    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(200, {
          accessToken,
          refreshToken: newRefreshToken
        }, 'Access token refreshed')
      );
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }
});

/**
 * @desc    Verify email
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, 'Email verification token is required');
  }

  const user = await User.findOne({
    emailVerificationToken: token
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, {}, 'Email verified successfully')
  );
});

/**
 * @desc    Resend email verification
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendEmailVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified');
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send verification email
  console.log(`Email verification token for ${email}: ${verificationToken}`);

  return res.status(200).json(
    new ApiResponse(200, {}, 'Verification email sent successfully')
  );
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if user exists or not
    return res.status(200).json(
      new ApiResponse(200, {}, 'If an account with that email exists, a password reset link has been sent')
    );
  }

  // Generate password reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send password reset email
  console.log(`Password reset token for ${email}: ${resetToken}`);

  return res.status(200).json(
    new ApiResponse(200, {}, 'If an account with that email exists, a password reset link has been sent')
  );
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, 'Token and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token');
  }

  // Reset password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, 'Password reset successfully')
  );
});

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user as IUser;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  // Get user with password
  const userWithPassword = await User.findById(user._id).select('+password');

  if (!userWithPassword) {
    throw new ApiError(404, 'User not found');
  }

  // Verify old password
  const isPasswordValid = userWithPassword.comparePassword(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, 'Invalid old password');
  }

  // Update password
  userWithPassword.password = newPassword;
  await userWithPassword.save();

  return res.status(200).json(
    new ApiResponse(200, {}, 'Password changed successfully')
  );
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  return res.status(200).json(
    new ApiResponse(200, user, 'Current user fetched successfully')
  );
});