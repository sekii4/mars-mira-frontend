import apiClient from './client';
import type { Checkpoint, CheckpointType } from './route';

// Ruta (etape i tačke) je fiksna i ne uređuje se kroz aplikaciju.
// Admin upravlja samo punktovima; etapa i redoslijed se određuju na backendu iz pozicije na ruti.

export interface CheckpointPayload {
  name: string;
  description: string;
  type: CheckpointType;
  lat: number;
  long: number;
}

interface CheckpointResponse {
  success: boolean;
  checkpoint: Checkpoint;
}

export const createCheckpoint = async (data: CheckpointPayload): Promise<CheckpointResponse> => {
  const response = await apiClient.post<CheckpointResponse>('/admin/checkpoints', data);
  return response.data;
};

export const updateCheckpoint = async (
  cid: number,
  data: Partial<CheckpointPayload>
): Promise<CheckpointResponse> => {
  const response = await apiClient.put<CheckpointResponse>(`/admin/checkpoints/${cid}`, data);
  return response.data;
};

export const deleteCheckpoint = async (cid: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/admin/checkpoints/${cid}`);
  return response.data;
};