export declare const FRONTEND_ROUTES: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly VERIFY_EMAIL: "/auth/verify-email";
        readonly VERIFY_EMAIL_STATUS: "/auth/verify-email/e/";
        readonly FORGOT_PASSWORD: "/auth/forgot-password";
        readonly RESET_PASSWORD: "/auth/reset-password";
    };
    readonly ONBOARDING: {
        readonly STEP_1: "/onboarding/step-1";
        readonly STEP_2: "/onboarding/step-2";
    };
    readonly DASHBOARD: {
        readonly HOME: "/";
        readonly FILES: "/files";
        readonly SETTINGS: "/settings";
        readonly STORAGE: "/storage";
    };
    readonly ERROR: {
        readonly GENERIC: "/error";
        readonly UNAUTHORIZED: "/unauthorized";
        readonly FORBIDDEN: "/forbidden";
    };
};
export declare const NAVIGATION_TYPES: {
    readonly PUSH: "push";
    readonly REPLACE: "replace";
};
export declare const NAVIGATION_REASONS: {
    readonly EMAIL_VERIFICATION_REQUIRED: "email_verification_required";
    readonly ONBOARDING_REQUIRED: "onboarding_required";
    readonly ONBOARDING_COMPLETED: "onboarding_completed";
    readonly VALIDATION_FAILED: "validation_failed";
    readonly SESSION_EXPIRED: "session_expired";
    readonly STORAGE_RESET: "storage_reset";
};
export type FrontendRoute = string;
export type NavigationType = typeof NAVIGATION_TYPES[keyof typeof NAVIGATION_TYPES];
export type NavigationReason = typeof NAVIGATION_REASONS[keyof typeof NAVIGATION_REASONS];
