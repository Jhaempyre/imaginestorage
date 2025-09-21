import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { onboardingApi } from "./api";

export const onboardingKeys = {
  onboarding: ['onboarding'] as const,
  storageProviders: ['storageProviders'] as const,
  storageProviderFields: ['onboarding', 'storageProviderFields'] as const,
} as const;

// Get current user query
export const useOnboardingStatus = (
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: onboardingKeys.onboarding,
    queryFn: onboardingApi.getOnboardingStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

// Get storage providers query
export const useGetStorageProviders = (
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: onboardingKeys.storageProviders,
    queryFn: onboardingApi.getStorageProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

// Get storage provider fields query
export const useGetStorageProviderFields = (
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: onboardingKeys.storageProviderFields,
    queryFn: onboardingApi.getStorageProviderFields,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};