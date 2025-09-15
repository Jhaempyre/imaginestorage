import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { authApi } from './api';
import { type CurrentUserResponse, type GetVerificationStatusDto, type GetVerificationStatusResponse } from './types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
} as const;

// Get current user query
export const useCurrentUser = (
  options?: Omit<UseQueryOptions<CurrentUserResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authApi.getCurrentUser,
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

// Helper hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { data, isLoading, error } = useCurrentUser({
    retry: false,
  });

  return {
    isAuthenticated: !!data?.data?.user && !error,
    isLoading,
    user: data?.data?.user,
  };
};

export const useGetEmailVerificationStatus = (data: GetVerificationStatusDto, options?: Omit<UseQueryOptions<GetVerificationStatusResponse, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: [...authKeys.all, 'emailVerificationStatus', data.email],
    queryFn: () => authApi.getEmailVerificationStatus(data),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};