import { useQuery } from '@tanstack/react-query';
import { apiKeysApi } from './api';

export const useApiKeyHistory = () => {
  return useQuery({
    queryKey: ['api-keys', 'history'],
    queryFn: () => apiKeysApi.getApiKeyHistory(),
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};