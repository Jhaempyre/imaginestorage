import { NavigationType, NavigationReason } from '../constants/routes.constants';
export interface NavigationControl {
    route: string;
    type: NavigationType;
    reason?: NavigationReason;
    params?: Record<string, any>;
    state?: Record<string, any>;
}
export interface ApiResponseWithNavigation<T = any> {
    success: boolean;
    message: string;
    data: T;
    navigation?: NavigationControl;
    error?: {
        code: string;
        details: string;
        suggestions?: string[];
    };
}
export interface UserNavigationState {
    isEmailVerified: boolean;
    isOnboardingComplete: boolean;
    hasStorageConfig: boolean;
    isActive: boolean;
}
export interface NavigationContext {
    currentRoute?: string;
    userAgent?: string;
    source?: string;
    metadata?: Record<string, any>;
}
