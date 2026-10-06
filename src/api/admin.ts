import apiClient from './client';
import type { MarchStatus } from './participation';

export interface AdminParticipant {
  uid: number;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  city: string;
  group_id: number | null;
  group_name: string | null;
  status: MarchStatus;
  start_at: string | null;
  finish_at: string | null;
}

export interface AdminParticipantDetail extends AdminParticipant {
  created_at: string;
  language: string;
  theme: string;
  join_code: string | null;
}

export interface ListParticipantsFilters {
  country?: string;
  city?: string;
  group_id?: number;
  status?: MarchStatus;
  search?: string;
}

export interface ListParticipantsResponse {
  success: boolean;
  count: number;
  participants: AdminParticipant[];
}

export const listParticipants = async (
  filters: ListParticipantsFilters = {}
): Promise<ListParticipantsResponse> => {
  const params: Record<string, string> = {};
  if (filters.country) params.country = filters.country;
  if (filters.city) params.city = filters.city;
  if (filters.group_id) params.group_id = String(filters.group_id);
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  const response = await apiClient.get<ListParticipantsResponse>('/admin/participants', { params });
  return response.data;
};

export interface ParticipantDetailResponse {
  success: boolean;
  participant: AdminParticipantDetail;
}

export const getParticipantDetail = async (uid: number): Promise<ParticipantDetailResponse> => {
  const response = await apiClient.get<ParticipantDetailResponse>(`/admin/participants/${uid}`);
  return response.data;
};

export interface AdminGroup {
  gid: number;
  name: string;
  join_code: string;
  created_by_uid: number | null;
  created_by_first_name: string | null;
  created_by_last_name: string | null;
  member_count: number;
}

export interface ListGroupsResponse {
  success: boolean;
  count: number;
  groups: AdminGroup[];
}

export const listGroups = async (): Promise<ListGroupsResponse> => {
  const response = await apiClient.get<ListGroupsResponse>('/admin/groups');
  return response.data;
};

export interface AdminGroupMember {
  uid: number;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  city: string;
  status: MarchStatus;
}

export interface AdminGroupDetail {
  gid: number;
  name: string;
  join_code: string;
  created_by_uid: number | null;
  created_by_first_name: string | null;
  created_by_last_name: string | null;
  members: AdminGroupMember[];
}

export interface GroupDetailResponse {
  success: boolean;
  group: AdminGroupDetail;
}

export const getGroupDetail = async (gid: number): Promise<GroupDetailResponse> => {
  const response = await apiClient.get<GroupDetailResponse>(`/admin/groups/${gid}`);
  return response.data;
};