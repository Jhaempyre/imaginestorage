import { useResendEmailVerification } from "@/api/auth/mutations";
import { useGetEmailVerificationStatus } from "@/api/auth/queries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EmailVerificationStatus() {
  const navigate = useNavigate();
  const { email } = useParams<{ email: string }>();
  const [resendCooldown, setResendCooldown] = useState(0);

  // Query verification status
  const {
    data: statusData,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useGetEmailVerificationStatus(
    { email: email! },
    {
      enabled: !!email,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Resend email mutation
  const resendEmailMutation = useResendEmailVerification({
    onSuccess: () => {
      // Refetch status after successful resend
      refetchStatus();
    },
  });

  // Handle server-side cooldown
  useEffect(() => {
    if (
      statusData?.data?.resendCooldown &&
      statusData.data.resendCooldown > 0
    ) {
      setResendCooldown(statusData.data.resendCooldown);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [statusData?.data?.resendCooldown]);

  const handleResendEmail = () => {
    if (email && resendCooldown === 0) {
      resendEmailMutation.mutate({ email });
    }
  };

  const handleRefreshStatus = () => {
    refetchStatus();
  };

  // Loading state
  if (isStatusLoading && !statusData) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
            <CardTitle className="text-2xl">
              Checking verification status...
            </CardTitle>
            <CardDescription>
              Please wait while we check your email verification status.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Error state
  if (statusError || !statusData?.success) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Unable to check status</CardTitle>
            <CardDescription>
              We couldn't check your email verification status at this time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {statusError?.message ||
                  "Please try again or contact support if the problem persists."}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button
                onClick={handleRefreshStatus}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/auth/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { isEmailVerified, isTokenExpired, expirationTime } = statusData.data;

  // Email already verified
  if (isEmailVerified) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Email already verified!</CardTitle>
            <CardDescription>
              Your email address has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You can now access all features of your account.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/auth/login")} className="w-full">
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Token expired
  if (isTokenExpired) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-orange-500" />
            </div>
            <CardTitle className="text-2xl">
              Verification link expired
            </CardTitle>
            <CardDescription>
              Your email verification link has expired. Request a new one to
              continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {email && (
              <Alert variant="warning">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  The verification link sent to <strong>{email}</strong> has
                  expired.
                </AlertDescription>
              </Alert>
            )}

            {resendEmailMutation.isSuccess && (
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  New verification email sent successfully! Please check your
                  inbox.
                </AlertDescription>
              </Alert>
            )}

            {resendEmailMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {resendEmailMutation.error?.message ||
                    "Failed to send verification email. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={
                  !email || resendCooldown > 0 || resendEmailMutation.isPending
                }
                className="w-full"
              >
                {resendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending new link...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  "Send new verification link"
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/auth/register")}
                className="w-full"
              >
                Back to Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email not verified, token still valid
  const expirationDate = new Date(expirationTime);
  const timeUntilExpiry = Math.max(
    0,
    Math.floor((expirationDate.getTime() - Date.now()) / 1000 / 60)
  ); // minutes

  return (
    <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Mail className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address. Click the link
            to verify your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {email && (
            <Alert variant="info">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Verification email sent to: <strong>{email}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>- Check your inbox and spam folder</p>
              <p>- Click the link to complete verification</p>
              {timeUntilExpiry > 0 && (
                <p>- Link expires in {timeUntilExpiry} minutes</p>
              )}
            </div>

            {resendEmailMutation.isSuccess && (
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Verification email sent successfully! Please check your inbox.
                </AlertDescription>
              </Alert>
            )}

            {resendEmailMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {resendEmailMutation.error?.message ||
                    "Failed to send verification email. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleRefreshStatus}
                variant="outline"
                className="w-full"
                disabled={isStatusLoading}
              >
                {isStatusLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Check verification status
                  </>
                )}
              </Button>

              <Button
                onClick={handleResendEmail}
                disabled={
                  !email || resendCooldown > 0 || resendEmailMutation.isPending
                }
                variant="outline"
                className="w-full"
              >
                {resendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  "Resend verification email"
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/auth/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
