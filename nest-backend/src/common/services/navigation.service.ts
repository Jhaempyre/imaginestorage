import { Injectable } from '@nestjs/common';
import { NavigationControl, UserNavigationState, NavigationContext } from '../interfaces/navigation.interface';
import { FRONTEND_ROUTES, NAVIGATION_TYPES, NAVIGATION_REASONS, FrontendRoute } from '../constants/routes.constants';
import { ONBOARDING_STEPS } from '../constants/storage.constants';
import { User } from '@/schemas/user.schema';

/**
 * Navigation Service
 * Centralized service for determining frontend navigation based on user state
 */
@Injectable()
export class NavigationService {

  /**
   * Determine navigation based on user state after authentication
   */
  getNavigationForUser(
    userState: UserNavigationState,
    context?: NavigationContext
  ): NavigationControl {
    // Email verification required
    if (!userState.isEmailVerified) {
      return {
        route: FRONTEND_ROUTES.AUTH.VERIFY_EMAIL,
        type: NAVIGATION_TYPES.REPLACE,
        reason: NAVIGATION_REASONS.EMAIL_VERIFICATION_REQUIRED,
      };
    }

    // Onboarding required
    if (!userState.isOnboardingComplete) {
      return {
        route: FRONTEND_ROUTES.ONBOARDING.STEP_1,
        type: NAVIGATION_TYPES.REPLACE,
        reason: NAVIGATION_REASONS.ONBOARDING_REQUIRED,
      };
    }

    // User is fully set up - go to dashboard
    return {
      route: FRONTEND_ROUTES.DASHBOARD.HOME,
      type: NAVIGATION_TYPES.REPLACE,
    };
  }

  /**
   * Get navigation for onboarding flow
   */
  getOnboardingNavigation(
    currentStep: string,
    success: boolean = true,
    context?: NavigationContext
  ): NavigationControl {
    if (!success) {
      // Stay on current step if validation failed
      const route = this.getRouteForOnboardingStep(currentStep);
      return {
        route,
        type: NAVIGATION_TYPES.REPLACE,
        reason: NAVIGATION_REASONS.VALIDATION_FAILED,
      };
    }

    switch (currentStep) {
      case ONBOARDING_STEPS.CHOOSE_PROVIDER:
        return {
          route: FRONTEND_ROUTES.ONBOARDING.STEP_2,
          type: NAVIGATION_TYPES.PUSH,
        };

      case ONBOARDING_STEPS.CONFIGURE_CREDENTIALS:
        return {
          route: FRONTEND_ROUTES.DASHBOARD.HOME,
          type: NAVIGATION_TYPES.REPLACE,
          reason: NAVIGATION_REASONS.ONBOARDING_COMPLETED,
        };

      default:
        return {
          route: FRONTEND_ROUTES.ONBOARDING.STEP_1,
          type: NAVIGATION_TYPES.REPLACE,
        };
    }
  }

  /**
   * Get navigation for authentication flows
   */
  getAuthNavigation(action: 'register' | 'verify-email' | 'login', user?: User): NavigationControl {
    switch (action) {
      case 'register':
        return {
          route: FRONTEND_ROUTES.AUTH.VERIFY_EMAIL,
          type: NAVIGATION_TYPES.PUSH,
          reason: NAVIGATION_REASONS.EMAIL_VERIFICATION_REQUIRED,
        };

      case 'verify-email':
        return {
          route: FRONTEND_ROUTES.ONBOARDING.STEP_1,
          type: NAVIGATION_TYPES.PUSH,
          reason: NAVIGATION_REASONS.ONBOARDING_REQUIRED,
        };

      case 'login':
        if (user?.isOnboardingComplete) {
          return {
            route: FRONTEND_ROUTES.DASHBOARD.HOME,
            type: NAVIGATION_TYPES.PUSH,
          }
        }

        else {
          return {
            route: FRONTEND_ROUTES.ONBOARDING.STEP_1,
            type: NAVIGATION_TYPES.REPLACE,
            reason: NAVIGATION_REASONS.ONBOARDING_REQUIRED,
          };
        }
    }
  }

  /**
   * Get navigation for error scenarios
   */
  getErrorNavigation(
    errorType: 'unauthorized' | 'forbidden' | 'generic',
    context?: NavigationContext
  ): NavigationControl {
    switch (errorType) {
      case 'unauthorized':
        return {
          route: FRONTEND_ROUTES.AUTH.LOGIN,
          type: NAVIGATION_TYPES.REPLACE,
          reason: NAVIGATION_REASONS.SESSION_EXPIRED,
        };

      case 'forbidden':
        return {
          route: FRONTEND_ROUTES.ERROR.FORBIDDEN,
          type: NAVIGATION_TYPES.REPLACE,
        };

      default:
        return {
          route: FRONTEND_ROUTES.ERROR.GENERIC,
          type: NAVIGATION_TYPES.REPLACE,
        };
    }
  }

  /**
   * Get navigation for storage configuration reset
   */
  getStorageResetNavigation(): NavigationControl {
    return {
      route: FRONTEND_ROUTES.ONBOARDING.STEP_1,
      type: NAVIGATION_TYPES.REPLACE,
      reason: NAVIGATION_REASONS.STORAGE_RESET,
    };
  }

  /**
   * Get navigation for dashboard sections
   */
  getDashboardNavigation(section?: 'files' | 'settings' | 'storage'): NavigationControl {
    let route: string = FRONTEND_ROUTES.DASHBOARD.HOME;

    switch (section) {
      case 'files':
        route = FRONTEND_ROUTES.DASHBOARD.FILES;
        break;
      case 'settings':
        route = FRONTEND_ROUTES.DASHBOARD.SETTINGS;
        break;
      case 'storage':
        route = FRONTEND_ROUTES.DASHBOARD.STORAGE;
        break;
    }

    return {
      route: route as FrontendRoute,
      type: NAVIGATION_TYPES.PUSH,
    };
  }

  /**
   * Helper method to get route for onboarding step
   */
  private getRouteForOnboardingStep(step: string): string {
    switch (step) {
      case ONBOARDING_STEPS.CHOOSE_PROVIDER:
        return FRONTEND_ROUTES.ONBOARDING.STEP_1;
      case ONBOARDING_STEPS.CONFIGURE_CREDENTIALS:
        return FRONTEND_ROUTES.ONBOARDING.STEP_2;
      default:
        return FRONTEND_ROUTES.ONBOARDING.STEP_1;
    }
  }

  /**
   * Validate if a route is a valid frontend route
   */
  isValidRoute(route: string): boolean {
    const allRoutes = Object.values(FRONTEND_ROUTES).flatMap(category =>
      Object.values(category)
    );
    return allRoutes.includes(route as any);
  }

  /**
   * Get navigation with custom parameters
   */
  createCustomNavigation(
    route: string,
    type: 'push' | 'replace',
    options?: {
      reason?: string;
      params?: Record<string, any>;
      state?: Record<string, any>;
    }
  ): NavigationControl {
    if (!this.isValidRoute(route)) {
      throw new Error(`Invalid route: ${route}`);
    }

    return {
      route: route as any,
      type: type as any,
      reason: options?.reason as any,
      params: options?.params,
      state: options?.state,
    };
  }
}