import { useOnboardingStatus } from "@/api/onboarding/queires";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, Loader2 } from "lucide-react";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useSubmitProviderSelection } from "@/api/onboarding/mutation";

interface ChooseProviderFormProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
}

function ChooseProviderForm({
  className,
  onSuccess,
  ...props
}: ChooseProviderFormProps) {
  const { data: statusData, isLoading: isStatusLoading } =
    useOnboardingStatus();
  // console.log(statusData);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      provider: "",
    },
  });

  const submitProviderSelection = useSubmitProviderSelection({
    onSuccess: console.log,
    onError: console.error,
  });
  const onSubmit = async (data: { provider: string }) => {
    try {
      console.log("Submitting:", { provider: data.provider });

      // TODO: Replace with actual API call
      submitProviderSelection.mutate({
        provider: data.provider,
      });
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.log({error})
      setError("root", {
        type: "manual",
        message: "Failed to save provider selection. Please try again.",
      });
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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Choose your storage provider to get started</CardTitle>
          <CardDescription>
            Select your preferred storage provider to get started with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Root error display */}
            {errors.root && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {errors.root.message}
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Choose your storage provider
              </Label>

              <Controller
                name="provider"
                control={control}
                rules={{ required: "Please select a storage provider" }}
                render={({ field }) => (
                  <div className="grid gap-3">
                    {statusData?.data?.availableProviders?.map(
                      (provider: any) => (
                        <div
                          key={provider.id}
                          className={cn(
                            "flex items-center gap-3 rounded-md border px-4 py-3 cursor-pointer transition-all duration-200",
                            field.value === provider.id
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          )}
                          onClick={() => field.onChange(provider.id)}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {provider.name}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {provider.description}
                            </div>
                            {provider.features &&
                              provider.features.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {provider.features
                                    .slice(0, 2)
                                    .map((feature: string, index: number) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                  {provider.features.length > 2 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                      +{provider.features.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                          <div className="flex-shrink-0">
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                field.value === provider.id
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              )}
                            >
                              {field.value === provider.id && (
                                <CheckIcon className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              />

              {errors.provider && (
                <p className="text-sm text-red-600">
                  {errors.provider.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
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
    </div>
  );
}

export default ChooseProviderForm;

// interface ChooseProviderFormProps extends React.ComponentProps<"div"> {
//   onSuccess?: () => void;
// }

// function ChooseProviderForm({
//   className,
//   onSuccess,
//   ...props
// }: ChooseProviderFormProps) {
//   const { data: statusData, isLoading: isStatusLoading } =
//     useOnboardingStatus();
//   console.log(statusData);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setError,
//   } = useForm();
//   const onSubmit = console.log;

//   if (isStatusLoading && !statusData) {
//     return (
//       <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
//         <Card>
//           <CardHeader className="text-center">
//             <div className="mx-auto mb-4">
//               <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
//             </div>
//             <CardTitle className="text-2xl">
//               Checking Onboarding status...
//             </CardTitle>
//             <CardDescription>
//               Please wait while we check your onboarding status.
//             </CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className={cn("flex flex-col gap-6", className)} {...props}>
//       <Card>
//         <CardHeader>
//           <CardTitle>Choose your storage provider to get started</CardTitle>
//           <CardDescription>
//             Select your preferred storage provider to get started with
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <div className="flex flex-col gap-6">
//               {/* Root error display */}
//               {errors.root && (
//                 <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
//                   {errors.root.message}
//                 </div>
//               )}

//               <div className="grid gap-3">
//                 <Label htmlFor="provider" className="text-sm">
//                   Choose your storage provider
//                 </Label>

//                 {statusData?.data?.availableProviders?.map((provider: any) => (
//                   <div
//                     key={provider.id}
//                     className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-100"
//                   >
//                     <div className="flex-1 flex flex-col">
//                       <div className="font-medium">{provider.name}</div>
//                       <div className="text-gray-500">
//                         {provider.description}
//                       </div>
//                     </div>
//                     <div className="flex-shrink-0">
//                       <CheckIcon className="h-5 w-5 text-green-500" />
//                     </div>
//                   </div>
//                 ))}

//                 {errors.provider && (
//                   <p className="text-sm text-red-600">
//                     {errors.provider.message}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default ChooseProviderForm;
