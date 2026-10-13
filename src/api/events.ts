import apiClient from './client';

export interface AdminEvent {
  eid: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface EventInput {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface EventsResponse {
  success: boolean;
  count: number;
  events: AdminEvent[];
}

interface EventResponse {
  success: boolean;
  event: AdminEvent;
}

export const listEvents = async (): Promise<AdminEvent[]> => {
  const response = await apiClient.get<EventsResponse>('/admin/events');
  return response.data.events;
};

export const createEvent = async (event: EventInput): Promise<AdminEvent> => {
  const response = await apiClient.post<EventResponse>('/admin/events', event);
  return response.data.event;
};

export const updateEvent = async (eid: number, event: EventInput): Promise<AdminEvent> => {
  const response = await apiClient.put<EventResponse>(`/admin/events/${eid}`, event);
  return response.data.event;
};

export const deleteEvent = async (eid: number): Promise<void> => {
  await apiClient.delete(`/admin/events/${eid}`);
};
