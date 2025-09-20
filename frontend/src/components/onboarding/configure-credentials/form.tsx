import { useSubmitProviderSelection } from "@/api/onboarding/mutation";
import { useOnboardingStatus } from "@/api/onboarding/queires";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Shield, Database } from "lucide-react";
import React from "react";
import { useForm, Controller } from "react-hook-form";

interface ConfigureCredentialsProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
}

interface FieldDefinition {
  name: string;
  label: string;
  type: "text" | "password" | "select" | "textarea";
  required: boolean;
  description: string;
  placeholder: string;
  options?: Array<{ value: string; label: string }>;
}

function ConfigureCredentials({
  className,
  onSuccess,
  ...props
}: ConfigureCredentialsProps) {
  const { data: statusData, isLoading: isStatusLoading } =
    useOnboardingStatus();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {},
  });

  const submitCredentials = useSubmitProviderSelection({
    onSuccess: (data) => {
      console.log("Credentials saved successfully:", data);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Failed to save credentials:", error);
      setError("root", {
        type: "manual",
        message: "Failed to save credentials. Please check your information and try again.",
      });
    },
  });

  const onSubmit = async (data: Record<string, any>) => {
    try {
      console.log("Submitting credentials:", data);
      submitCredentials.mutate(data);
    } catch (error) {
      console.log({ error });
      setError("root", {
        type: "manual",
        message: "Failed to save credentials. Please try again.",
      });
    }
  };

  const renderField = (fieldName: string, fieldDef: FieldDefinition) => {
    const commonProps = {
      key: fieldName,
      name: fieldName,
      control,
      rules: {
        required: fieldDef.required ? `${fieldDef.label} is required` : false,
      },
    };

    switch (fieldDef.type) {
      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {fieldDef.label}
              {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              {...commonProps}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={fieldDef.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldDef.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {fieldDef.description && (
              <p className="text-sm text-gray-500">{fieldDef.description}</p>
            )}
            {errors[fieldName] && (
              <p className="text-sm text-red-600">
                {errors[fieldName]?.message}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {fieldDef.label}
              {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              {...commonProps}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id={fieldName}
                  placeholder={fieldDef.placeholder}
                  rows={4}
                  className="resize-none"
                />
              )}
            />
            {fieldDef.description && (
              <p className="text-sm text-gray-500">{fieldDef.description}</p>
            )}
            {errors[fieldName] && (
              <p className="text-sm text-red-600">
                {errors[fieldName]?.message}
              </p>
            )}
          </div>
        );

      default: // text and password
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {fieldDef.label}
              {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              {...commonProps}
              render={({ field }) => (
                <Input
                  {...field}
                  id={fieldName}
                  type={fieldDef.type}
                  placeholder={fieldDef.placeholder}
                />
              )}
            />
            {fieldDef.description && (
              <p className="text-sm text-gray-500">{fieldDef.description}</p>
            )}
            {errors[fieldName] && (
              <p className="text-sm text-red-600">
                {errors[fieldName]?.message}
              </p>
            )}
          </div>
        );
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "aws":
        return <Database className="h-5 w-5 text-orange-500" />;
      case "gcp":
        return <Database className="h-5 w-5 text-blue-500" />;
      case "azure":
        return <Database className="h-5 w-5 text-blue-600" />;
      case "local":
        return <Database className="h-5 w-5 text-gray-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "aws":
        return "Amazon S3";
      case "gcp":
        return "Google Cloud Storage";
      case "azure":
        return "Azure Blob Storage";
      case "local":
        return "Local Storage";
      default:
        return "Storage Provider";
    }
  };

  if (isStatusLoading && !statusData) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
            <CardTitle className="text-2xl">
              Checking Onboarding status...
            </CardTitle>
            <CardDescription>
              Please wait while we check your onboarding status.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const requiredFields = statusData?.data?.requiredFields;
  const selectedProvider = statusData?.data?.selectedProvider;

  if (!requiredFields || !selectedProvider) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">
              Configuration Error
            </CardTitle>
            <CardDescription>
              Unable to load provider configuration. Please go back and select a provider.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 max-w-2xl mx-auto", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getProviderIcon(selectedProvider)}
            <div>
              <CardTitle className="text-xl">
                Configure {getProviderName(selectedProvider)} Credentials
              </CardTitle>
              <CardDescription>
                Enter your {getProviderName(selectedProvider)} credentials to complete the setup
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Root error display */}
            {errors.root && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {errors.root.message}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {Object.entries(requiredFields).map(([fieldName, fieldDef]) =>
                renderField(fieldName, fieldDef as FieldDefinition)
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || submitCredentials.isPending}
                className="min-w-32"
              >
                {isSubmitting || submitCredentials.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Security Notice</div>
              <p className="text-blue-700">
                Your credentials are encrypted and stored securely. We recommend using
                dedicated service accounts with minimal required permissions for enhanced security.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConfigureCredentials;