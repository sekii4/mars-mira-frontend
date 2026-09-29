import apiClient from './client';
import type { UserProfile } from './auth';

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  country: string;
  city: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export const updateProfile = async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  const response = await apiClient.patch<UpdateProfileResponse>('/participant/profile', data);
  return response.data;
};