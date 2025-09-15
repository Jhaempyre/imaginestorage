import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ErrorNormalizer } from './normalizer';
import { ErrorHandler } from './handler';
import { type NormalizedError, type ErrorHandlerConfig, ErrorType } from './types';

/**
 * Global Error Interceptor
 * Intercepts all axios requests and responses to handle errors consistently
 */
export class ErrorInterceptor {
  private static config: ErrorHandlerConfig = {
    enableNetworkDetection: true,
    enableAutoRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    enableLogging: true,
    enableUserNotification: true
  };

  private static retryCount = new Map<string, number>();

  /**
   * Configure the error interceptor
   */
  static configure(config: Partial<ErrorHandlerConfig>) {
    ErrorInterceptor.config = { ...ErrorInterceptor.config, ...config };
  }

  /**
   * Request interceptor
   */
  static onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Add request timestamp for timeout tracking
    config.metadata = {
      ...config.metadata,
      startTime: Date.now(),
      requestId: ErrorInterceptor.generateRequestId()
    };

    // Log request if enabled
    if (ErrorInterceptor.config.enableLogging) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        requestId: config.metadata.requestId,
        data: config.data
      });
    }

    return config;
  }

  /**
   * Request error interceptor
   */
  static onRequestError(error: any): Promise<never> {
    const normalizedError = ErrorNormalizer.normalize(error);

    if (ErrorInterceptor.config.enableLogging) {
      console.error('[API Request Error]', normalizedError);
    }

    return Promise.reject(normalizedError);
  }

  /**
   * Response interceptor
   */
  static onResponse(response: AxiosResponse): AxiosResponse {
    const requestId = response.config.metadata?.requestId;
    const duration = Date.now() - (response.config.metadata?.startTime || 0);

    // Log successful response if enabled
    if (ErrorInterceptor.config.enableLogging) {
      console.log(`[API Response] ${response.status} ${response.config.url}`, {
        requestId,
        duration: `${duration}ms`,
        data: response.data
      });
    }

    // Check for navigation in successful response
    if (response.data?.navigation) {
      const normalizedError: NormalizedError = {
        type: ErrorType.BACKEND_NAVIGATION,
        statusCode: response.status,
        code: 'NAVIGATION_REQUIRED',
        message: response.data.message || '',
        userFriendlyMessage: '',
        navigation: response.data.navigation,
        shouldRetry: false,
        shouldRefresh: false,
        originalError: null
      };

      // Handle navigation immediately
      if (normalizedError.navigation) {
        ErrorHandler.handleNavigation(normalizedError.navigation);
      }
    }

    return response;
  }

  /**
   * Response error interceptor
   */
  static async onResponseError(error: AxiosError): Promise<any> {
    const requestId = error.config?.metadata?.requestId;
    const normalizedError = ErrorNormalizer.normalize(error);

    if (ErrorInterceptor.config.enableLogging) {
      console.error(`[API Response Error] ${error.response?.status || 'Network'} ${error.config?.url}`, {
        requestId,
        error: normalizedError
      });
    }

    // Handle auto-retry for retryable errors
    if (ErrorInterceptor.shouldRetry(error, normalizedError)) {
      return ErrorInterceptor.retryRequest(error);
    }

    // Handle the error through the error handler
    // ErrorHandler.handle(normalizedError);
    
    // Handle navigation immediately
    if (normalizedError.navigation) {
      ErrorHandler.handleNavigation(normalizedError.navigation);
    }

    return Promise.reject(normalizedError);
  }

  /**
   * Check if request should be retried
   */
  private static shouldRetry(error: AxiosError, normalizedError: NormalizedError): boolean {
    if (!ErrorInterceptor.config.enableAutoRetry || !normalizedError.shouldRetry) {
      return false;
    }

    const requestKey = ErrorInterceptor.getRequestKey(error.config);
    const currentRetries = ErrorInterceptor.retryCount.get(requestKey) || 0;

    return currentRetries < ErrorInterceptor.config.maxRetries;
  }

  /**
   * Retry the failed request
   */
  private static async retryRequest(error: AxiosError): Promise<any> {
    const requestKey = ErrorInterceptor.getRequestKey(error.config);
    const currentRetries = ErrorInterceptor.retryCount.get(requestKey) || 0;

    ErrorInterceptor.retryCount.set(requestKey, currentRetries + 1);

    // Wait before retrying
    await ErrorInterceptor.delay(ErrorInterceptor.config.retryDelay * Math.pow(2, currentRetries));

    if (ErrorInterceptor.config.enableLogging) {
      console.log(`[API Retry] Attempt ${currentRetries + 1}/${ErrorInterceptor.config.maxRetries} for ${error.config?.url}`);
    }

    // Import axios dynamically to avoid circular dependency
    const axios = (await import('../client/axios-client')).default;

    try {
      const response = await axios.request(error.config!);
      // Clear retry count on success
      ErrorInterceptor.retryCount.delete(requestKey);
      return response as any;
    } catch (retryError) {
      // If ErrorInterceptor was the last retry, clear the count and let it fail
      if (currentRetries + 1 >= ErrorInterceptor.config.maxRetries) {
        ErrorInterceptor.retryCount.delete(requestKey);
      }
      throw retryError;
    }
  }

  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get unique key for request (for retry tracking)
   */
  private static getRequestKey(config: any): string {
    return `${config?.method}_${config?.url}_${JSON.stringify(config?.data || {})}`;
  }

  /**
   * Delay utility for retries
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear retry counts (useful for cleanup)
   */
  static clearRetryCount() {
    ErrorInterceptor.retryCount.clear();
  }
}