import { useMutation, useQueryClient, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { ErrorHandler, type NormalizedError } from "../error";
import { onboardingApi } from "./api";
import { onboardingKeys } from "./queires";

type SubmitProviderSelectionData = Awaited<ReturnType<typeof onboardingApi.submitProviderSelection>>;

export const useSubmitProviderSelection = (
  options?: UseMutationOptions<SubmitProviderSelectionData, Error, unknown>
): UseMutationResult<SubmitProviderSelectionData, Error, unknown> => {
  const queryClient = useQueryClient();

  const { onSuccess, onError, ...rest } = options || {};
  return useMutation<SubmitProviderSelectionData, Error, unknown>({
    mutationFn: onboardingApi.submitProviderSelection,
    mutationKey: onboardingKeys.storageProviderFields,

    onSuccess: async (data, variables, context) => {
      // Invalidate & refetch all onboarding-related queries
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.onboarding });
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.storageProviderFields });

      // Call user-provided callback (if any)
      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      ErrorHandler.handle(error as unknown as NormalizedError);
      onError?.(error, variables, context);
    },

    ...rest,
  });
};

type SubmitConfigureCredentialsData = Awaited<ReturnType<typeof onboardingApi.submitProviderSelection>>;

export const useSubmitConfigureCredentials = (
  options?: UseMutationOptions<SubmitConfigureCredentialsData, Error, unknown>
): UseMutationResult<SubmitConfigureCredentialsData, Error, unknown> => {
  const queryClient = useQueryClient();

  const { onSuccess, onError, ...rest } = options || {};
  return useMutation<SubmitConfigureCredentialsData, Error, unknown>({
    mutationFn: onboardingApi.submitConfigureCredentials,
    mutationKey: onboardingKeys.storageProviderFields,

    onSuccess: async (data, variables, context) => {
      // Invalidate & refetch all onboarding-related queries
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.onboarding });
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.storageProviderFields });

      // Call user-provided callback (if any)
      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      ErrorHandler.handle(error as unknown as NormalizedError);
      onError?.(error, variables, context);
    },

    ...rest,
  });
};


