import type { NormalizedError } from './types';
import { ErrorType } from './types';

/**
 * Simple Error Notification System
 */
export class ErrorNotificationSystem {
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('[ErrorNotificationSystem] Initialized');
  }

  static showNotification(error: NormalizedError): void {
    // Don't show notifications for navigation signals
    if (error.type === ErrorType.BACKEND_NAVIGATION) {
      return;
    }

    // For now, just log the error - can be enhanced later
    console.error('[ErrorNotification]', {
      type: error.type,
      message: error.userFriendlyMessage,
      details: error.details,
      suggestions: error.suggestions
    });

    // Could show a toast notification here
    // For now, we'll use a simple alert for critical errors
    if (error.shouldRefresh) {
      const shouldRefresh = confirm(
        `${error.userFriendlyMessage}\n\nWould you like to refresh the page?`
      );
      if (shouldRefresh) {
        window.location.reload();
      }
    }
  }

  static clearAll(): void {
    // Clear any notifications
    console.log('[ErrorNotificationSystem] Cleared all notifications');
  }
}