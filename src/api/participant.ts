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

export interface ParticipantSettings {
  location_sharing: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'bs' | 'en';
}

export interface SettingsResponse {
  success: boolean;
  message?: string;
  settings: ParticipantSettings;
}

export const updateProfile = async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  const response = await apiClient.patch<UpdateProfileResponse>('/participant/profile', data);
  return response.data;
};

export const getParticipantSettings = async (): Promise<SettingsResponse> => {
  const response = await apiClient.get<SettingsResponse>('/participant/settings');
  return response.data;
};

export const updateParticipantSettings = async (
  data: Partial<ParticipantSettings>
): Promise<SettingsResponse> => {
  const response = await apiClient.patch<SettingsResponse>('/participant/settings', data);
  return response.data;
};