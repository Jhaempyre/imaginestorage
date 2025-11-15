"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationService = void 0;
const common_1 = require("@nestjs/common");
const routes_constants_1 = require("../constants/routes.constants");
const storage_constants_1 = require("../constants/storage.constants");
let NavigationService = class NavigationService {
    getNavigationForUser(userState, context) {
        if (!userState.isEmailVerified) {
            return {
                route: routes_constants_1.FRONTEND_ROUTES.AUTH.VERIFY_EMAIL,
                type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
                reason: routes_constants_1.NAVIGATION_REASONS.EMAIL_VERIFICATION_REQUIRED,
            };
        }
        if (!userState.isOnboardingComplete) {
            return {
                route: routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_1,
                type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
                reason: routes_constants_1.NAVIGATION_REASONS.ONBOARDING_REQUIRED,
            };
        }
        return {
            route: routes_constants_1.FRONTEND_ROUTES.DASHBOARD.HOME,
            type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
        };
    }
    getOnboardingNavigation(currentStep, success = true, context) {
        if (!success) {
            const route = this.getRouteForOnboardingStep(currentStep);
            return {
                route,
                type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
                reason: routes_constants_1.NAVIGATION_REASONS.VALIDATION_FAILED,
            };
        }
        switch (currentStep) {
            case storage_constants_1.ONBOARDING_STEPS.CHOOSE_PROVIDER:
                return {
                    route: routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_2,
                    type: routes_constants_1.NAVIGATION_TYPES.PUSH,
                };
            case storage_constants_1.ONBOARDING_STEPS.CONFIGURE_CREDENTIALS:
                return {
                    route: routes_constants_1.FRONTEND_ROUTES.DASHBOARD.HOME,
                    type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
                    reason: routes_constants_1.NAVIGATION_REASONS.ONBOARDING_COMPLETED,
                };
            default:
                return {
                    route: routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_1,
                    type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
                };
        }
    }
    getAuthNavigation(action, user, config) {
        switch (action) {
            case 'register':
                return {
                    route: user ? `${routes_constants_1.FRONTEND_ROUTES.AUTH.VERIFY_EMAIL_STATUS}${user.email}` : routes_constants_1.FRONTEND_ROUTES.AUTH.LOGIN,
                    type: routes_constants_1.NAVIGATION_TYPES.PUSH,
                    reason: routes_constants_1.NAVIGATION_REASONS.EMAIL_VERIFICATION_REQUIRED,
                };
            case 'verify-email':
                return {
                    route: routes_constants_1.FRONTEND_ROUTES.AUTH.LOGIN,
                    type: routes_constants_1.NAVIGATION_TYPES.PUSH,
                };
            case 'login':
                if (user?.isOnboardingComplete) {
                    return {
                        route: routes_constants_1.FRONTEND_ROUTES.DASHBOARD.HOME,
                        type: routes_constants_1.NAVIGATION_TYPES.PUSH,
                    };
                }
                else if (!config?.provider) {
                    return {
                        route: routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_1,
                        type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
                        reason: routes_constants_1.NAVIGATION_REASONS.ONBOARDING_REQUIRED,
                    };
                }
                else if (!config?.credentials || config.isValidated) {
                    return {
                        route: routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_2,
                        type: routes_constants_1.NAVIGATION_TYPES.PUSH,
                    };
                }
        }
    }
    getErrorNavigation(errorType, context) {
        switch (errorType) {
            case 'unauthorized':
                return {
                    route: routes_constants_1.FRONTEND_ROUTES.AUTH.LOGIN,
                    type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
                    reason: routes_constants_1.NAVIGATION_REASONS.SESSION_EXPIRED,
                };
            case 'forbidden':
                return {
                    route: routes_constants_1.FRONTEND_ROUTES.ERROR.FORBIDDEN,
                    type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
                };
            default:
                return {
                    route: routes_constants_1.FRONTEND_ROUTES.ERROR.GENERIC,
                    type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
                };
        }
    }
    getStorageResetNavigation() {
        return {
            route: routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_1,
            type: routes_constants_1.NAVIGATION_TYPES.REPLACE,
            reason: routes_constants_1.NAVIGATION_REASONS.STORAGE_RESET,
        };
    }
    getDashboardNavigation(section) {
        let route = routes_constants_1.FRONTEND_ROUTES.DASHBOARD.HOME;
        switch (section) {
            case 'files':
                route = routes_constants_1.FRONTEND_ROUTES.DASHBOARD.FILES;
                break;
            case 'settings':
                route = routes_constants_1.FRONTEND_ROUTES.DASHBOARD.SETTINGS;
                break;
            case 'storage':
                route = routes_constants_1.FRONTEND_ROUTES.DASHBOARD.STORAGE;
                break;
        }
        return {
            route: route,
            type: routes_constants_1.NAVIGATION_TYPES.PUSH,
        };
    }
    getRouteForOnboardingStep(step) {
        switch (step) {
            case storage_constants_1.ONBOARDING_STEPS.CHOOSE_PROVIDER:
                return routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_1;
            case storage_constants_1.ONBOARDING_STEPS.CONFIGURE_CREDENTIALS:
                return routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_2;
            default:
                return routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_1;
        }
    }
    isValidRoute(route) {
        const allRoutes = Object.values(routes_constants_1.FRONTEND_ROUTES).flatMap(category => Object.values(category));
        return allRoutes.includes(route);
    }
    createCustomNavigation(route, type, options) {
        if (!this.isValidRoute(route)) {
            throw new Error(`Invalid route: ${route}`);
        }
        return {
            route: route,
            type: type,
            reason: options?.reason,
            params: options?.params,
            state: options?.state,
        };
    }
};
exports.NavigationService = NavigationService;
exports.NavigationService = NavigationService = __decorate([
    (0, common_1.Injectable)()
], NavigationService);
//# sourceMappingURL=navigation.service.js.map