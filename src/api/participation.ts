import apiClient from './client';

export type MarchStatus = 'registered' | 'active' | 'finished';

export interface Participation {
  pid: number;
  group_id: number | null;
  start_at: string | null;
  finish_at: string | null;
}

export interface ParticipationResponse {
  success: boolean;
  message?: string;
  participation: Participation | null;
  status: MarchStatus;
}

export const getParticipationStatus = async (): Promise<ParticipationResponse> => {
  const response = await apiClient.get<ParticipationResponse>('/participation/me');
  return response.data;
};

export const startMarch = async (): Promise<ParticipationResponse> => {
  const response = await apiClient.post<ParticipationResponse>('/participation/start');
  return response.data;
};

export const finishMarch = async (): Promise<ParticipationResponse> => {
  const response = await apiClient.post<ParticipationResponse>('/participation/finish');
  return response.data;
};