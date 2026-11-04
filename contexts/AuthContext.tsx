'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, AdminProfile, ApiError, AuthResponse, AUTH_EXPIRED_EVENT, ProfileUpdate } from '@/lib/api';
import { disablePushOnSignOut } from '@/lib/push';
import { hasAny, Permission } from '@/lib/permissions';

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
  /**
   * Whether the signed-in account holds any of these permissions. Only shapes what
   * the website shows; the API enforces the same permissions on every request.
   */
  can: (permission: Permission | Permission[]) => boolean;
}

/** How often an open tab re-reads the profile, so revoked permissions disappear. */
const PROFILE_REFRESH_MS = 5 * 60 * 1000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** The account saved at the last sign-in or profile load, if any. */
function readCachedUser(): AdminProfile | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AdminProfile) : null;
  } catch {
    return null;
  }
}

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
      localStorage.setItem('user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        // The server rejected the session: expired, revoked or deactivated.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      // The server could not be reached or was slow: keep the session and the account
      // as last known, rather than signing someone out over a network blip.
      const cached = readCachedUser();
      setState(
        cached
          ? { user: cached, isAuthenticated: true, isLoading: false }
          : { user: null, isAuthenticated: false, isLoading: false },
      );
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void checkAuth();
    }, 0);
    return () => clearTimeout(id);
  }, [checkAuth]);

  // Permissions can change while a tab stays open (an admin revokes one). Re-read the
  // profile when the tab regains focus and every few minutes; the API already refuses
  // the revoked calls, this just stops showing what no longer works.
  useEffect(() => {
    const refresh = async () => {
      if (!localStorage.getItem('accessToken')) return;
      try {
        const user = await authApi.getProfile();
        setState((prev) => (prev.isAuthenticated ? { ...prev, user } : prev));
      } catch {
        // A 401 signs out through AUTH_EXPIRED_EVENT; anything else keeps what we had.
      }
    };
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    const timer = setInterval(() => void refresh(), PROFILE_REFRESH_MS);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(timer);
    };
  }, []);

  // The API rejected the token (expired, or password changed/reset elsewhere).
  useEffect(() => {
    const onExpired = () => setState({ user: null, isAuthenticated: false, isLoading: false });
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const storeSession = async (response: AuthResponse) => {
    localStorage.setItem('accessToken', response.accessToken);
    // The sign-in response has no permissions; the profile does.
    const user = await authApi.getProfile().catch(() => response.user);
    localStorage.setItem('user', JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false });
    return user;
  };

  // No isLoading here: the admin layout swaps in a spinner while it is set, which
  // would unmount the login page and lose its error. The page shows its own spinner.
  const login = async (identifier: string, password: string) => {
    try {
      const value = identifier.trim();
      const credentials = value.includes('@') ? { email: value } : { phone: value };
      return await storeSession(await authApi.login(credentials, password));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed. Please try again.');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      return await storeSession(await authApi.changePassword(currentPassword, newPassword));
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
    // A full load of the sign-in page: nothing from the old session stays in memory,
    // and no page guard can race this with a redirect of its own.
    window.location.replace('/login');
  };

  const updateProfile = async (data: ProfileUpdate) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setState(prev => ({
        ...prev,
        // The update response has no permissions; keep the ones we hold.
        user: { ...updatedUser, permissions: updatedUser.permissions ?? prev.user?.permissions },
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update profile. Please try again.');
    }
  };

  const can = useCallback(
    (permission: Permission | Permission[]) => hasAny(state.user?.permissions, permission),
    [state.user],
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth, updateProfile, changePassword, can }}>
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





