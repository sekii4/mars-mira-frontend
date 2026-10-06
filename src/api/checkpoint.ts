import apiClient from './client';

export interface CheckpointVisit {
  vid: number;
  checkpoint_id: number;
  reached_at: string;
  name: string;
  description?: string;
  type?: string;
  stage_day?: number;
  order_index?: number;
  lat?: number;
  long?: number;
}

export interface ProgressSummary {
  participationId: number | null;
  totalCheckpoints: number;
  visitedCheckpoints: number;
  progressPercentage: number;
  totalDistanceKm: number;
  completedDistanceKm: number;
  elapsedSeconds: number;
  isStarted: boolean;
  isFinished: boolean;
  startAt: string | null;
  finishAt: string | null;
  visits: CheckpointVisit[];
}

export interface VisitResponse {
  success: boolean;
  message?: string;
  visit: CheckpointVisit;
}

export const getCheckpointVisits = async (): Promise<CheckpointVisit[]> => {
  const response = await apiClient.get<{ success: boolean; visits: CheckpointVisit[] }>(
    '/checkpoints/visits'
  );
  return response.data.visits;
};

export const recordManualCheckpointVisit = async (checkpointId: number): Promise<VisitResponse> => {
  const response = await apiClient.post<VisitResponse>(`/checkpoints/${checkpointId}/visit`);
  return response.data;
};

export const getProgressSummary = async (): Promise<ProgressSummary> => {
  const response = await apiClient.get<{ success: boolean; progress: ProgressSummary }>(
    '/checkpoints/progress'
  );
  return response.data.progress;
};
