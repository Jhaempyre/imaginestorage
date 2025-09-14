import axiosClient from '../client/axios-client';
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
  type CurrentUserResponse,
  type BasicResponse,
  type VerifyEmailResponse,
} from './types';

// Auth API functions
export const authApi = {
  // Register a new user
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Refresh access token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await axiosClient.post<RefreshTokenResponse>('/auth/refresh-token');
    return response.data;
  },

  // Logout user
  logout: async (): Promise<BasicResponse> => {
    const response = await axiosClient.post<BasicResponse>('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await axiosClient.get<CurrentUserResponse>('/auth/me');
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordDto): Promise<BasicResponse> => {
    const response = await axiosClient.post<BasicResponse>('/auth/change-password', data);
    return response.data;
  },

  // Verify email
  verifyEmail: async (data: VerifyEmailDto): Promise<VerifyEmailResponse> => {
    const response = await axiosClient.post<VerifyEmailResponse>('/auth/verify-email', data);
    return response.data;
  },

  // Resend email verification
  resendEmailVerification: async (data: ResendEmailVerificationDto): Promise<BasicResponse> => {
    const response = await axiosClient.post<BasicResponse>('/auth/resend-verification', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordDto): Promise<BasicResponse> => {
    const response = await axiosClient.post<BasicResponse>('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordDto): Promise<BasicResponse> => {
    const response = await axiosClient.post<BasicResponse>('/auth/reset-password', data);
    return response.data;
  },
};