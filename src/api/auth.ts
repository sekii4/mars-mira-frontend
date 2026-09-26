import apiClient from './client';

export interface UserProfile {
  uid: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'participant' | 'admin';
  country?: string;
  city?: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  country: string;
  city: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: UserProfile;
}

export interface MeResponse {
  success: boolean;
  user: UserProfile;
}

export const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getMe = async (): Promise<MeResponse> => {
  const response = await apiClient.get<MeResponse>('/auth/me');
  return response.data;
};
