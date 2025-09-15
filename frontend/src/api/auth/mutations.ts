import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { authApi } from './api';
import { authKeys } from './queries';
import {
  type RegisterDto,
  type LoginDto,
  type ChangePasswordDto,
  type VerifyEmailDto,
  type ResendEmailVerificationDto,
  type ForgotPasswordDto,
  type ResetPasswordDto,
  type AuthResponse,
  type RefreshTokenResponse,
  type BasicResponse,
  type VerifyEmailResponse,
} from './types';
import { ErrorHandler, type NormalizedError } from '../error';

// Register mutation
export const useRegister = (
  options?: UseMutationOptions<AuthResponse, Error, RegisterDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Update current user cache if registration includes user data
      if (data.data?.user) {
        queryClient.setQueryData(authKeys.currentUser(), {
          success: true,
          message: 'User retrieved successfully',
          data: { user: data.data.user },
        });
      }
    },
    // onError: (error) => {
    //   // Handle register-specific errors - error will be normalized by interceptor
    //   console.error('Register error:', error);
    // },
    ...options,
  });
};

// Login mutation
export const useLogin = (
  options?: UseMutationOptions<AuthResponse, Error, LoginDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Update current user cache
      if (data.data?.user) {
        queryClient.setQueryData(authKeys.currentUser(), {
          success: true,
          message: 'User retrieved successfully',
          data: { user: data.data.user },
        });
      }
    },
    onError: (error: unknown) => {
      // Handle login-specific errors - error will be normalized by interceptor
      // console.error('Login error:', error);
      ErrorHandler.handle(error as NormalizedError);
    },
    ...options,
  });
};

// Logout mutation
export const useLogout = (
  options?: UseMutationOptions<BasicResponse, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: authKeys.all });
      // Optionally clear all cache
      queryClient.clear();
    },
    onError: (error: unknown) => ErrorHandler.handle(error as NormalizedError),
    ...options,
  });
};

// Refresh token mutation
export const useRefreshToken = (
  options?: UseMutationOptions<RefreshTokenResponse, Error, void>
) => {
  return useMutation({
    mutationFn: authApi.refreshToken,
    onError: (error: unknown) => ErrorHandler.handle(error as NormalizedError),
    ...options,
  });
};

// Change password mutation
export const useChangePassword = (
  options?: UseMutationOptions<BasicResponse, Error, ChangePasswordDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      // Clear auth cache since user needs to login again
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
    onError: (error: unknown) => ErrorHandler.handle(error as NormalizedError),
    ...options,
  });
};

// Verify email mutation
export const useVerifyEmail = (
  options?: UseMutationOptions<VerifyEmailResponse, Error, VerifyEmailDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      // Update current user cache with verified user
      queryClient.setQueryData(authKeys.currentUser(), {
        success: true,
        message: 'User retrieved successfully',
        data: { user: data.data },
      });
    },
    onError: (error: unknown) => ErrorHandler.handle(error as NormalizedError),
    ...options,
  });
};

// Resend email verification mutation
export const useResendEmailVerification = (
  options?: UseMutationOptions<BasicResponse, Error, ResendEmailVerificationDto>
) => {
  return useMutation({
    mutationFn: authApi.resendEmailVerification,
    onError: (error: unknown) => ErrorHandler.handle(error as NormalizedError),
    ...options,
  });
};

// Forgot password mutation
export const useForgotPassword = (
  options?: UseMutationOptions<BasicResponse, Error, ForgotPasswordDto>
) => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onError: (error: unknown) => ErrorHandler.handle(error as NormalizedError),
    ...options,
  });
};

// Reset password mutation
export const useResetPassword = (
  options?: UseMutationOptions<BasicResponse, Error, ResetPasswordDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      // Clear auth cache since user needs to login again
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
    onError: (error: unknown) => ErrorHandler.handle(error as NormalizedError),
    ...options,
  });
};