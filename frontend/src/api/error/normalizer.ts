import type { AxiosError } from 'axios';
import type {
  BackendResponse,
  NavigationControl,
  NetworkStatus,
  NormalizedError
} from './types';
import {
  ErrorType,
  NetworkErrorCode
} from './types';

/**
 * Global Error Normalizer
 * Converts various error types into a standardized format
 */
export class ErrorNormalizer {

  /**
   * Main normalization function
   */
  static normalize(error: any): NormalizedError {
    // 1. Check for network errors first
    if (this.isNetworkError(error)) {
      return this.normalizeNetworkError(error);
    }

    // 2. Check for backend business errors
    if (this.isBackendError(error)) {
      return this.normalizeBackendError(error);
    }

    // 3. Check for frontend runtime errors
    if (this.isFrontendError(error)) {
      return this.normalizeFrontendError(error);
    }

    // 4. Fallback to unknown error
    return this.normalizeUnknownError(error);
  }

  /**
   * Extract navigation from response if present
   */
  static extractNavigation(error: any): NavigationControl | undefined {
    // Check if it's an axios error with response data
    if (error?.response?.data?.navigation) {
      return error.response.data.navigation;
    }

    // Check if it's a direct backend response
    if (error?.navigation) {
      return error.navigation;
    }

    return undefined;
  }

  /**
   * Check if error has navigation instructions
   */
  static hasNavigation(error: any): boolean {
    return !!this.extractNavigation(error);
  }

  /**
   * Network error detection and normalization
   */
  private static isNetworkError(error: any): boolean {
    if (!error?.code && !error?.message) return false;

    const networkCodes = ['NETWORK_ERROR', 'ENOTFOUND', 'ECONNREFUSED', 'TIMEOUT'];
    const networkMessages = ['network error', 'fetch', 'connection', 'timeout'];

    return networkCodes.some(code => error.code?.includes(code)) ||
      networkMessages.some(msg => error.message?.toLowerCase().includes(msg)) ||
      !navigator.onLine;
  }

  private static normalizeNetworkError(error: any): NormalizedError {
    let code: string = NetworkErrorCode.NO_INTERNET;
    let message = 'Network connection failed';
    let userFriendlyMessage = 'Please check your internet connection and try again.';

    if (error.code?.includes('ENOTFOUND')) {
      code = NetworkErrorCode.DNS_ERROR;
      message = 'DNS resolution failed';
      userFriendlyMessage = 'Unable to reach the server. Please try again later.';
    } else if (error.code?.includes('TIMEOUT')) {
      code = NetworkErrorCode.TIMEOUT;
      message = 'Request timeout';
      userFriendlyMessage = 'The request is taking too long. Please try again.';
    } else if (error.code?.includes('ECONNREFUSED')) {
      code = NetworkErrorCode.CONNECTION_REFUSED;
      message = 'Connection refused';
      userFriendlyMessage = 'Unable to connect to the server. Please try again later.';
    }

    return {
      type: ErrorType.NETWORK,
      statusCode: error?.status || error.response?.status || 500,
      code,
      message,
      userFriendlyMessage,
      shouldRetry: true,
      shouldRefresh: false,
      originalError: error
    };
  }

  /**
   * Backend error detection and normalization
   */
  private static isBackendError(error: any): boolean {
    return error?.response?.status >= 400 && error?.response?.status < 600;
  }

  private static normalizeBackendError(error: AxiosError): NormalizedError {
    const responseData = error.response?.data as BackendResponse;

    // Extract navigation if present
    const navigation = this.extractNavigation(error);
    const hasNavigationSignal = !!navigation;

    return {
      type: hasNavigationSignal ? ErrorType.BACKEND_NAVIGATION : ErrorType.BACKEND_BUSINESS,
      code: responseData.error?.code!,
      statusCode: error?.status || error.response?.status || 500,
      message: responseData?.message,
      userFriendlyMessage: responseData?.error?.userMessage || '',
      navigation,
      shouldRetry: false,
      shouldRefresh: false,
      originalError: error
    };
  }

  /**
   * Frontend error detection and normalization
   */
  private static isFrontendError(error: any): boolean {
    return error instanceof Error &&
      !error.message?.includes('fetch') &&
      !error.message?.includes('network');
  }

  private static normalizeFrontendError(error: Error): NormalizedError {
    return {
      type: ErrorType.FRONTEND_RUNTIME,
      statusCode: 500,
      code: 'RUNTIME_ERROR',
      message: error.message,
      userFriendlyMessage: 'Something went wrong in the app. Please refresh the page and try again.',
      shouldRetry: false,
      shouldRefresh: true,
      originalError: error
    };
  }

  /**
   * Unknown error fallback
   */
  private static normalizeUnknownError(error: any): NormalizedError {
    return {
      type: ErrorType.UNKNOWN,
      statusCode: error?.status || error.response?.status || 500,
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'Unknown error occurred',
      userFriendlyMessage: 'An unexpected error occurred. Please try again.',
      shouldRetry: true,
      shouldRefresh: false,
      originalError: error
    };
  }

  /**
   * Network status detection
   */
  static getNetworkStatus(): NetworkStatus {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    return {
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt
    };
  }
}