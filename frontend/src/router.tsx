import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout, LoginPage, RegisterPage } from "./components/auth";
import { PrivateLayout } from "./components/private";
import { useErrorHandler } from "./hooks/useErrorHandler";
import VerifyEmail from "./components/auth/verify-email";
import EmailVerificationStatus from "./components/auth/email-verification-status";

function RouterContent() {
  // Initialize global error handling
  useErrorHandler();

  return (
    <Routes>
      {/* Protected Routes */}
      <Route path="/" element={<PrivateLayout />}>
        <Route
          index
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Home Page</h1>
              <p className="mb-4">Add your main app content here</p>
              {process.env.NODE_ENV === "development" && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Development Tools
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        Error handling system is active. Check console for error
                        logs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />
        {/* Add more protected routes here */}
        {/* Onboarding Routes */}
        <Route path="/onboarding">
          <Route
            path="step-1"
            element={<div>Onboarding Step 1 - Choose Provider</div>}
          />
          <Route
            path="step-2"
            element={<div>Onboarding Step 2 - Configure Credentials</div>}
          />
        </Route>
      </Route>

      {/* Public Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email/:token" element={<VerifyEmail />} />
        <Route
          path="verify-email/e/:email"
          element={<EmailVerificationStatus />}
        />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function Router() {
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
}

export default Router;
