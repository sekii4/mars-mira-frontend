import { createContext } from 'react';
import type { UserProfile, LoginPayload, RegisterPayload } from '../api/auth';

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginPayload) => Promise<UserProfile>;
  register: (data: RegisterPayload) => Promise<UserProfile>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);