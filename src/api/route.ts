import apiClient from './client';

export interface Stage {
  rid: number;
  event_id: number;
  name: string;
  distance: number;
  stage_day: number;
}

export type CheckpointType = 'start' | 'camp' | 'aid' | 'water' | 'finish' | 'checkpoint';

export interface Checkpoint {
  cid: number;
  route_id: number;
  name: string;
  description: string;
  type: CheckpointType;
  stage_day: number;
  lat: number;
  long: number;
  order_index: number;
}

export interface RoutePoint {
  rid: number;
  route_id: number;
  lat: number;
  long: number;
  stage_day: number;
  order_index: number;
}

export interface RouteResponse {
  success: boolean;
  event: {
    eid: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
  } | null;
  stages: Stage[];
  checkpoints: Checkpoint[];
  points: RoutePoint[];
  total_checkpoints: number;
  total_points: number;
}

export const getRoute = async (stageDay?: number): Promise<RouteResponse> => {
  const params = stageDay ? { stage_day: stageDay } : {};
  const response = await apiClient.get<RouteResponse>('/route', { params });
  return response.data;
};
