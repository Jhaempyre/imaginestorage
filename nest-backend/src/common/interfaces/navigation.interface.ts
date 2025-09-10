import { FrontendRoute, NavigationType, NavigationReason } from '../constants/routes.constants';

/**
 * Navigation Control Interface
 * Defines how the backend instructs the frontend to navigate
 */
export interface NavigationControl {
  /** Target route to navigate to */
  route: FrontendRoute;
  
  /** Navigation type - push adds to history, replace replaces current */
  type: NavigationType;
  
  /** Optional reason for the navigation */
  reason?: NavigationReason;
  
  /** Optional route parameters */
  params?: Record<string, any>;
  
  /** Optional state to pass with navigation */
  state?: Record<string, any>;
}

/**
 * API Response with Navigation
 * Standard response format that includes navigation instructions
 */
export interface ApiResponseWithNavigation<T = any> {
  /** Whether the request was successful */
  success: boolean;
  
  /** Response message */
  message: string;
  
  /** Response data */
  data: T;
  
  /** Navigation instructions for frontend */
  navigation?: NavigationControl;
  
  /** Error details (if success is false) */
  error?: {
    code: string;
    details: string;
    suggestions?: string[];
  };
}

/**
 * User State for Navigation Decisions
 */
export interface UserNavigationState {
  isEmailVerified: boolean;
  isOnboardingComplete: boolean;
  hasStorageConfig: boolean;
  isActive: boolean;
}

/**
 * Navigation Context
 * Additional context that might influence navigation decisions
 */
export interface NavigationContext {
  /** Current route user is on */
  currentRoute?: string;
  
  /** User agent information */
  userAgent?: string;
  
  /** Request source (web, mobile, etc.) */
  source?: string;
  
  /** Any additional metadata */
  metadata?: Record<string, any>;
}