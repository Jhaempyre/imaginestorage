import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi } from './api';
import type { CreateApiKeyRequest } from './types';

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => apiKeysApi.createApiKey(data),
    onSuccess: () => {
      // Invalidate API key history to refresh the list
      queryClient.invalidateQueries({ queryKey: ['api-keys', 'history'] });
    },
    onError: (error) => {
      console.error('Failed to create API key:', error);
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => apiKeysApi.revokeApiKey(keyId),
    onSuccess: () => {
      // Invalidate API key history to refresh the list
      queryClient.invalidateQueries({ queryKey: ['api-keys', 'history'] });
    },
    onError: (error) => {
      console.error('Failed to revoke API key:', error);
    },
  });
};