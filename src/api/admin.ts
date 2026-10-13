import apiClient from './client';
import type { MarchStatus } from './participation';

export interface AdminParticipant {
  uid: number;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  city: string;
  is_domestic?: boolean;
  event_id: number | null;
  event_name: string | null;
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
  is_domestic?: boolean;
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
  if (typeof filters.is_domestic === 'boolean') params.is_domestic = String(filters.is_domestic);

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

export interface DomesticVsForeignBreakdown {
  is_domestic: boolean;
  label: string;
  count: number;
  percentage: number;
}

export interface DomesticVsForeignStats {
  domestic: number;
  foreign: number;
  domestic_percentage: number;
  foreign_percentage: number;
  breakdown: DomesticVsForeignBreakdown[];
}

export interface StatusBreakdown {
  status: MarchStatus;
  label: string;
  count: number;
  percentage: number;
}

export interface ByStatusStats {
  registered: number;
  active: number;
  finished: number;
  breakdown: StatusBreakdown[];
}

export interface CountryCityStat {
  country: string;
  city: string;
  is_domestic: boolean;
  count: number;
  percentage: number;
}

export interface CountryStat {
  country: string;
  is_domestic: boolean;
  count: number;
  percentage: number;
}

export interface CityStat {
  city: string;
  country: string;
  count: number;
  percentage: number;
}

export interface TopGroupStat {
  gid: number;
  name: string;
  join_code: string;
  member_count: number;
}

export interface GroupsStatistics {
  total_groups: number;
  participants_in_groups: number;
  independent_participants: number;
  avg_group_size: number;
  largest_group: {
    gid: number;
    name: string;
    member_count: number;
  } | null;
  top_groups: TopGroupStat[];
}

export interface AdminStatisticsResponse {
  success: boolean;
  event: {
    eid: number;
    name: string;
    start_date: string;
    end_date: string;
  } | null;
  total_participants: number;
  domestic_vs_foreign: DomesticVsForeignStats;
  by_status: ByStatusStats;
  by_country_and_city: CountryCityStat[];
  by_country: CountryStat[];
  by_city: CityStat[];
  groups: GroupsStatistics;
}

export const getAdminStatistics = async (): Promise<AdminStatisticsResponse> => {
  const response = await apiClient.get<AdminStatisticsResponse>('/admin/statistics');
  return response.data;
};
