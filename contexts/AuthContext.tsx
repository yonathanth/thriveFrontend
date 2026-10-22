'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, AdminProfile, ApiError, AuthResponse, AUTH_EXPIRED_EVENT, ProfileUpdate } from '@/lib/api';
import { disablePushOnSignOut } from '@/lib/push';

interface AuthState {
  user: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  /** identifier is an email (admins) or a phone number (any account). */
  login: (identifier: string, password: string) => Promise<AdminProfile>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AdminProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await authApi.getProfile();
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void checkAuth();
    }, 0);
    return () => clearTimeout(id);
  }, [checkAuth]);

  // The API rejected the token (expired, or password changed/reset elsewhere).
  useEffect(() => {
    const onExpired = () => setState({ user: null, isAuthenticated: false, isLoading: false });
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const storeSession = (response: AuthResponse) => {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    setState({ user: response.user, isAuthenticated: true, isLoading: false });
    return response.user;
  };

  // No isLoading here: the admin layout swaps in a spinner while it is set, which
  // would unmount the login page and lose its error. The page shows its own spinner.
  const login = async (identifier: string, password: string) => {
    try {
      const value = identifier.trim();
      const credentials = value.includes('@') ? { email: value } : { phone: value };
      return storeSession(await authApi.login(credentials, password));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed. Please try again.');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      return storeSession(await authApi.changePassword(currentPassword, newPassword));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to change password. Please try again.');
    }
  };

  const logout = () => {
    // This browser stops getting the admin's push notifications; runs on after sign-out.
    void disablePushOnSignOut(localStorage.getItem('accessToken'));
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const updateProfile = async (data: ProfileUpdate) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update profile. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}





