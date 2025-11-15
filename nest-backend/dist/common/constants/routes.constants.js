"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAVIGATION_REASONS = exports.NAVIGATION_TYPES = exports.FRONTEND_ROUTES = void 0;
exports.FRONTEND_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        VERIFY_EMAIL: '/auth/verify-email',
        VERIFY_EMAIL_STATUS: '/auth/verify-email/e/',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },
    ONBOARDING: {
        STEP_1: '/onboarding/step-1',
        STEP_2: '/onboarding/step-2',
    },
    DASHBOARD: {
        HOME: '/',
        FILES: '/files',
        SETTINGS: '/settings',
        STORAGE: '/storage',
    },
    ERROR: {
        GENERIC: '/error',
        UNAUTHORIZED: '/unauthorized',
        FORBIDDEN: '/forbidden',
    },
};
exports.NAVIGATION_TYPES = {
    PUSH: 'push',
    REPLACE: 'replace',
};
exports.NAVIGATION_REASONS = {
    EMAIL_VERIFICATION_REQUIRED: 'email_verification_required',
    ONBOARDING_REQUIRED: 'onboarding_required',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    VALIDATION_FAILED: 'validation_failed',
    SESSION_EXPIRED: 'session_expired',
    STORAGE_RESET: 'storage_reset',
};
//# sourceMappingURL=routes.constants.js.map