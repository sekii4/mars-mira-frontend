import apiClient from './client';

export interface GroupMember {
  uid: number;
  first_name: string;
  last_name: string;
}

export interface Group {
  gid: number;
  name: string;
  join_code: string;
  is_owner: boolean;
  members: GroupMember[];
}

export interface GroupResponse {
  success: boolean;
  message?: string;
  group: Group | null;
}

export const getMyGroup = async (): Promise<GroupResponse> => {
  const response = await apiClient.get<GroupResponse>('/groups/me');
  return response.data;
};

export const createGroup = async (name: string): Promise<GroupResponse> => {
  const response = await apiClient.post<GroupResponse>('/groups', { name });
  return response.data;
};

export const joinGroup = async (code: string): Promise<GroupResponse> => {
  const response = await apiClient.post<GroupResponse>('/groups/join', { code });
  return response.data;
};