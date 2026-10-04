import apiClient from './client';

export interface SendLocationPayload {
  latitude: number;
  longitude: number;
}

export interface SendLocationResponse {
  success: boolean;
  location: {
    lid: number;
    latitude: number;
    longitude: number;
    recorded_at: string;
  };
}

export const sendLocation = async (data: SendLocationPayload): Promise<SendLocationResponse> => {
  const response = await apiClient.post<SendLocationResponse>('/location', data);
  return response.data;
};

export interface GroupMemberLocation {
  uid: number;
  first_name: string;
  last_name: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

export interface GroupLocationsResponse {
  success: boolean;
  in_group: boolean;
  locations: GroupMemberLocation[];
}

export const getGroupLocations = async (): Promise<GroupLocationsResponse> => {
  const response = await apiClient.get<GroupLocationsResponse>('/location/group');
  return response.data;
};