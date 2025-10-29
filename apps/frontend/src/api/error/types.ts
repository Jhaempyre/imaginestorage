// Error Types for Frontend Error Handling

export const ErrorType = {
  NETWORK: 'NETWORK',
  BACKEND_BUSINESS: 'BACKEND_BUSINESS', 
  BACKEND_NAVIGATION: 'BACKEND_NAVIGATION',
  FRONTEND_RUNTIME: 'FRONTEND_RUNTIME',
  UNKNOWN: 'UNKNOWN'
} as const;

export const NetworkErrorCode = {
  NO_INTERNET: 'NO_INTERNET',
  DNS_ERROR: 'DNS_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED'
} as const;

export const BackendErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];
export type NetworkErrorCode = typeof NetworkErrorCode[keyof typeof NetworkErrorCode];
export type BackendErrorCode = string;

// Navigation interface matching backend
export interface NavigationControl {
  route: string;
  type: 'push' | 'replace';
  reason?: string;
  params?: Record<string, any>;
  state?: Record<string, any>;
}

// Backend response structure
export interface BackendResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  navigation?: NavigationControl;
  error?: {
    code: string;
    details: string;
    suggestions?: string[];
    userMessage?: string;
  };
}

// Normalized error structure
export interface NormalizedError {
  type: ErrorType;
  code: string;
  statusCode: number;
  message: string;
  details?: string;
  suggestions?: string[];
  navigation?: NavigationControl;
  originalError?: any;
  userFriendlyMessage: string;
  shouldRetry: boolean;
  shouldRefresh: boolean;
}

// Network detection result
export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

// Error handler configuration
export interface ErrorHandlerConfig {
  enableNetworkDetection: boolean;
  enableAutoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableLogging: boolean;
  enableUserNotification: boolean;
}