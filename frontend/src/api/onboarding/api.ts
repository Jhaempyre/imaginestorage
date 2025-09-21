import axiosClient from "../client/axios-client";

export const onboardingApi = {

  // Get storage providers
  getStorageProviders: async (): Promise<any> => {
    const response = await axiosClient.get<any>('/onboarding/get-storage-providers');
    return response.data;
  },

  // Get storage provider fields
  getStorageProviderFields: async (): Promise<any> => {
    const response = await axiosClient.get<any>('/onboarding/get-storage-provider-fields');
    return response.data;
  },

  // Get onboarding status
  getOnboardingStatus: async (): Promise<any> => {
    const response = await axiosClient.get<any>('/onboarding/status');
    return response.data;
  },

  // Submit provider selection
  submitProviderSelection: async (data: any): Promise<any> => {
    const response = await axiosClient.post<any>('/onboarding/choose-provider', data);
    return response.data;
  },

  // Submit configure credentials
  submitConfigureCredentials: async (data: any): Promise<any> => {
    const response = await axiosClient.post<any>('/onboarding/configure-credentials', data);
    return response.data;
  },

}