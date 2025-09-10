/**
 * Frontend Route Constants
 * These constants define all the frontend routes that the backend can navigate to
 */

export const FRONTEND_ROUTES = {
  // Authentication Routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },

  // Onboarding Routes
  ONBOARDING: {
    STEP_1: '/onboarding/step-1',  // Choose Provider
    STEP_2: '/onboarding/step-2',  // Configure Credentials
  },

  // Main Application Routes
  DASHBOARD: {
    HOME: '/dashboard',
    FILES: '/dashboard/files',
    SETTINGS: '/dashboard/settings',
    STORAGE: '/dashboard/storage',
  },

  // Error Routes
  ERROR: {
    GENERIC: '/error',
    UNAUTHORIZED: '/unauthorized',
    FORBIDDEN: '/forbidden',
  },
} as const;

/**
 * Navigation Types
 */
export const NAVIGATION_TYPES = {
  PUSH: 'push',
  REPLACE: 'replace',
} as const;

/**
 * Navigation Reasons
 */
export const NAVIGATION_REASONS = {
  EMAIL_VERIFICATION_REQUIRED: 'email_verification_required',
  ONBOARDING_REQUIRED: 'onboarding_required',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  VALIDATION_FAILED: 'validation_failed',
  SESSION_EXPIRED: 'session_expired',
  STORAGE_RESET: 'storage_reset',
} as const;

/**
 * Type definitions for TypeScript support
 */
export type FrontendRoute = string;
export type NavigationType = typeof NAVIGATION_TYPES[keyof typeof NAVIGATION_TYPES];
export type NavigationReason = typeof NAVIGATION_REASONS[keyof typeof NAVIGATION_REASONS];