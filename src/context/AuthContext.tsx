import { useState, useEffect, type ReactNode } from 'react';
import {
  type UserProfile,
  type LoginPayload,
  type RegisterPayload,
  loginUser,
  registerUser,
  getMe,
} from '../api/auth';
import { AuthContext } from './authContextDef';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mm_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('mm_token');
      if (storedToken) {
        try {
          const res = await getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('mm_token');
            setToken(null);
            setUser(null);
          }
        } catch {
          localStorage.removeItem('mm_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginPayload) => {
    const res = await loginUser(data);
    if (res.token && res.user) {
      localStorage.setItem('mm_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (data: RegisterPayload) => {
    const res = await registerUser(data);
    if (res.token && res.user) {
      localStorage.setItem('mm_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('mm_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
