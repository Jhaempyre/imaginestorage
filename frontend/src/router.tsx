import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout, LoginPage, RegisterPage } from "./components/auth";
import { PrivateLayout } from "./components/private";
import { useErrorHandler } from "./hooks/useErrorHandler";
import VerifyEmail from "./components/auth/verify-email";
import EmailVerificationStatus from "./components/auth/email-verification-status";
import ChooseProviderPage from "./components/onboarding/choose-provider";
import ConfigureCredentialsPage from "./components/onboarding/configure-credentials";
import { AllFilesPage, MediaLibraryLayout } from "./components/media-library";

function RouterContent() {
  // Initialize global error handling
  useErrorHandler();

  return (
    <Routes>
      {/* Protected Routes */}
      <Route path="/" element={<PrivateLayout />}>
        <Route index element={<Navigate to="/dashbaord" replace />} />
        <Route path="dashbaord" element={<MediaLibraryLayout />}>
          <Route index element={<AllFilesPage />} />
        </Route>

        {/* Onboarding Routes */}
        <Route path="/onboarding">
          <Route path="step-1" element={<ChooseProviderPage />} />
          <Route path="step-2" element={<ConfigureCredentialsPage />} />
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
