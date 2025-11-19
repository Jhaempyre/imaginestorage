import { useVerifyEmail } from "@/api/auth/mutations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  
  // Mutations
  const verifyEmailMutation = useVerifyEmail({
    onSuccess: () => {
      setVerificationStatus("success");
      // Navigate based on backend response
      // if (data.navigation?.redirectTo) {
      //   setTimeout(() => {
      //     navigate(data.navigation!.redirectTo!, { replace: true });
      //   }, 2000);
      // }
    },
    onError: () => {
      setVerificationStatus("error");
    },
  });

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate({ token });
    }
  }, [token]);

  // If token is present, show verification result
  if (token) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {verificationStatus === "pending" && (
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              )}
              {verificationStatus === "success" && (
                <CheckCircle className="h-12 w-12 text-green-500" />
              )}
              {verificationStatus === "error" && (
                <AlertCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {verificationStatus === "pending" && "Verifying your email..."}
              {verificationStatus === "success" &&
                "Email verified successfully!"}
              {verificationStatus === "error" && "Verification failed"}
            </CardTitle>
            <CardDescription>
              {verificationStatus === "pending" &&
                "Please wait while we verify your email address."}
              {verificationStatus === "success" &&
                <>
                  <p>Your email has been verified. Redirecting you to complete your setup...</p>
                  <Link to="/auth/login" className="text-blue-500 underline mt-2 block">Go to Login Page</Link>
                </>}
              {verificationStatus === "error" &&
                "The verification link is invalid or has expired."}
            </CardDescription>
          </CardHeader>

          {verificationStatus === "error" && (
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {verifyEmailMutation.error?.message ||
                    "Please try requesting a new verification email."}
                </AlertDescription>
              </Alert>
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth/register")}
                  className="w-full"
                >
                  Back to Registration
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  } else {
    navigate("/auth/login");
  }
}
