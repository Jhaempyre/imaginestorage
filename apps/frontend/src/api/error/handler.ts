import type { NavigateFunction } from 'react-router-dom';
import type { QueryClient } from '@tanstack/react-query';
import type { NormalizedError, NavigationControl } from './types';
import { ErrorType } from './types';
import { toast } from 'sonner';

/**
 * Global Error Handler
 * Handles normalized errors and takes appropriate actions
 */
export class ErrorHandler {
  private static navigate: NavigateFunction | null = null;
  private static queryClient: QueryClient | null = null;
  private static notificationHandler: ((error: NormalizedError) => void) | null = null;

  /**
   * Initialize the error handler with dependencies
   */
  static initialize(
    navigate: NavigateFunction,
    queryClient: QueryClient,
    notificationHandler?: (error: NormalizedError) => void
  ) {
    this.navigate = navigate;
    this.queryClient = queryClient;
    this.notificationHandler = notificationHandler || null;
  }

  /**
   * Main error handling function
   */
  static handle(error: NormalizedError): void {
    console.log('[ErrorHandler] Handling error:', error);

    // Handle navigation first if present
    if (error.navigation) {
      this.handleNavigation(error.navigation);
      return; // Don't show notification for navigation signals
    }

    // Handle different error types
    switch (error.type) {
      case ErrorType.NETWORK:
        this.handleNetworkError(error);
        break;

      case ErrorType.BACKEND_BUSINESS:
        this.handleBackendError(error);
        break;

      case ErrorType.BACKEND_NAVIGATION:
        this.handleNavigationError(error);
        break;

      case ErrorType.FRONTEND_RUNTIME:
        this.handleFrontendError(error);
        break;

      case ErrorType.UNKNOWN:
      default:
        this.handleUnknownError(error);
        break;
    }

    // Show user notification if handler is available
    if (this.notificationHandler) {
      this.notificationHandler(error);
    }
  }

  /**
   * Handle navigation instructions
   */
  static handleNavigation(navigation: NavigationControl): void {
    if (!this.navigate) {
      console.warn('[ErrorHandler] Navigate function not initialized');
      return;
    }

    console.log('[ErrorHandler] Navigating:', navigation);

    const navigateOptions: any = {};

    if (navigation.type === 'replace') {
      navigateOptions.replace = true;
    }

    if (navigation.state) {
      navigateOptions.state = navigation.state;
    }

    // Handle route with parameters
    let route = navigation.route;
    if (navigation.params) {
      // Simple parameter replacement for routes like /user/:id
      Object.entries(navigation.params).forEach(([key, value]) => {
        route = route.replace(`:${key}`, String(value));
      });
    }

    this.navigate(route, navigateOptions);
  }

  /**
   * Handle network errors
   */
  private static handleNetworkError(error: NormalizedError): void {
    console.log('[ErrorHandler] Network error:', error);
    toast.error(error.userFriendlyMessage);
    // Could implement network status monitoring here
    // Could show offline banner
    // Could queue requests for when network returns
  }

  /**
   * Handle backend business errors
   */
  private static handleBackendError(error: NormalizedError): void {
    console.log('[ErrorHandler] Backend error:', error);

    // Handle specific backend errors
    switch (error.code) {
      case 'UNAUTHORIZED':
        this.handleUnauthorized();
        break;

      case 'FORBIDDEN':
        // Could redirect to access denied page
        break;
    }
  }

  /**
   * Handle navigation errors (backend signals)
   */
  private static handleNavigationError(error: NormalizedError): void {
    console.log('[ErrorHandler] Navigation signal:', error);

    if (error.navigation) {
      this.handleNavigation(error.navigation);
    }
  }

  /**
   * Handle frontend runtime errors
   */
  private static handleFrontendError(error: NormalizedError): void {
    console.error('[ErrorHandler] Frontend error:', error);

    // Could implement error reporting here
    // Could show error boundary
    if (error.shouldRefresh) {
      // Could show refresh prompt
    }
  }

  /**
   * Handle unknown errors
   */
  private static handleUnknownError(error: NormalizedError): void {
    console.error('[ErrorHandler] Unknown error:', error);

    // Fallback error handling
    toast.error(error.userFriendlyMessage ?? error.message ?? 'An unexpected error occurred');
  }

  /**
   * Handle unauthorized errors (401)
   */
  private static handleUnauthorized(): void {
    console.log('[ErrorHandler] Handling unauthorized access');

    // Clear auth-related cache
    if (this.queryClient) {
      this.queryClient.removeQueries({ queryKey: ['auth'] });
    }

    // Redirect to login
    if (this.navigate) {
      this.navigate('/auth/login', { replace: true });
    }
  }
}