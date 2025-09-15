import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorHandler, ErrorInterceptor } from '../api/error';
import { ErrorNotificationSystem } from '../api/error/notifications';
import type { NormalizedError } from '../api/error';

/**
 * Hook to initialize global error handling
 * Should be called once at the app level
 */
export function useErrorHandler() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize error notification system
    ErrorNotificationSystem.initialize();

    // Initialize error handler with dependencies
    ErrorHandler.initialize(
      navigate,
      queryClient,
      (error: NormalizedError) => {
        ErrorNotificationSystem.showNotification(error);
      }
    );

    // Configure error interceptor
    ErrorInterceptor.configure({
      enableNetworkDetection: true,
      enableAutoRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableLogging: process.env.NODE_ENV === 'development',
      enableUserNotification: true
    });

    console.log('[ErrorHandler] Global error handling initialized');

    // Cleanup function
    return () => {
      ErrorNotificationSystem.clearAll();
      ErrorInterceptor.clearRetryCount();
    };
  }, [navigate, queryClient]);
}

/**
 * Hook for handling API-specific errors
 * Use this in components that need custom error handling for specific APIs
 */
export function useApiErrorHandler() {
  return {
    handleError: (_apiName: string, error: any) => {
      ErrorHandler.handle(error);
    }
  };
}