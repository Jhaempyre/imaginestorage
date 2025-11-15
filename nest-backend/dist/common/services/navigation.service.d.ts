import { NavigationControl, UserNavigationState, NavigationContext } from '../interfaces/navigation.interface';
import { User } from '@/schemas/user.schema';
import { UserStorageConfigDocument } from '@/schemas/user-storage-config.schema';
export declare class NavigationService {
    getNavigationForUser(userState: UserNavigationState, context?: NavigationContext): NavigationControl;
    getOnboardingNavigation(currentStep: string, success?: boolean, context?: NavigationContext): NavigationControl;
    getAuthNavigation(action: 'register' | 'verify-email' | 'login', user?: User, config?: UserStorageConfigDocument): NavigationControl;
    getErrorNavigation(errorType: 'unauthorized' | 'forbidden' | 'generic', context?: NavigationContext): NavigationControl;
    getStorageResetNavigation(): NavigationControl;
    getDashboardNavigation(section?: 'files' | 'settings' | 'storage'): NavigationControl;
    private getRouteForOnboardingStep;
    isValidRoute(route: string): boolean;
    createCustomNavigation(route: string, type: 'push' | 'replace', options?: {
        reason?: string;
        params?: Record<string, any>;
        state?: Record<string, any>;
    }): NavigationControl;
}
