import axiosClient from "../client/axios-client";

export const onboardingApi = {
  // Get onboarding status
  getOnboardingStatus: async (): Promise<any> => {
    const response = await axiosClient.get<any>('/onboarding/status');
    return response.data;
  },
  
  // Submit provider selection
  submitProviderSelection: async (data: any): Promise<any> => {
    const response = await axiosClient.post<any>('/onboarding/choose-provider', data);
    return response.data;
  }

}