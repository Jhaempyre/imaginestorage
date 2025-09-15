import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isNormalizedError, useLogin } from "@/api";

// Zod validation schema
const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({
  className,
  onSuccess,
  onSwitchToRegister,
  ...props
}: LoginFormProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin({
    onSuccess: (data) => {
      console.log("Login successful:", data);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Login failed:", error);
      // Set form-level error
      if (isNormalizedError(error)) {
        setError("root", {
          type: "manual",
          message:
            error.userFriendlyMessage ?? "Login failed. Please try again.",
        });
      } else {
        setError("root", {
          type: "manual",
          message: "Login failed. Please try again.",
        });
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email or username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* Root error display */}
              {errors.root && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {errors.root.message}
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="john@example.com or johndoe"
                  {...register("emailOrUsername")}
                  aria-invalid={!!errors.emailOrUsername}
                />
                {errors.emailOrUsername && (
                  <p className="text-sm text-red-600">
                    {errors.emailOrUsername.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(!showForgotPassword)}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {showForgotPassword && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  <p>
                    Forgot password functionality will be implemented soon.
                    Please contact support if you need help accessing your
                    account.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
                {/* <Button variant="outline" className="w-full" type="button">
                  Login with Google
                </Button> */}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
