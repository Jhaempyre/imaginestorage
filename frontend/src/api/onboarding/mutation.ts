import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { ErrorHandler, type NormalizedError } from "../error";
import { onboardingApi } from "./api";
import { onboardingKeys } from "./queires";

// Change password mutation
export const useSubmitProviderSelection = (
  options?: UseMutationOptions<any, Error, any>
) => {
  const queryClient = useQueryClient();
  console.log({options});
  return useMutation({
    mutationFn: onboardingApi.submitProviderSelection,
    onSuccess: () => {
      // Clear auth cache since user needs to login again
      queryClient.removeQueries({ queryKey: onboardingKeys.onboarding });
    },
    onError: (error: unknown) => ErrorHandler.handle(error as NormalizedError),
    ...options,
  });
};