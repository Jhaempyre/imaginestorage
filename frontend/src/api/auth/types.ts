// Auth DTOs
export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  emailOrUsername: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResendEmailVerificationDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

// Response Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Navigation {
  nextStep?: string;
  allowedRoutes?: string[];
  redirectTo?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken: string;
  };
  navigation?: Navigation;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface BasicResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data: User;
  navigation?: Navigation;
}