import axiosClient from '../client/axios-client';
import type { CreateApiKeyRequest, ApiKeyResponse, ApiKeyHistoryResponse, ApiResponse } from './types';

export const apiKeysApi = {
  /**
   * Create a new API key
   */
  createApiKey: async (data: CreateApiKeyRequest): Promise<ApiResponse<ApiKeyResponse>> => {
    const response = await axiosClient.post('/api-keys', data);
    return response.data;
  },

  /**
   * Get API key history for the current user
   */
  getApiKeyHistory: async (): Promise<ApiResponse<ApiKeyHistoryResponse>> => {
    const response = await axiosClient.get('/api-keys/history');
    return response.data;
  },

  /**
   * Revoke an API key
   */
  revokeApiKey: async (keyId: string): Promise<ApiResponse<null>> => {
    const response = await axiosClient.delete(`/api-keys/${keyId}`);
    return response.data;
  },
};