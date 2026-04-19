import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiServices } from '../services/api';

const STORAGE_KEY = 'fitsenseUser';
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((value) => {
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      setUser(value);
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const storedUser = localStorage.getItem(STORAGE_KEY);

      if (!storedUser) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.token) {
          localStorage.removeItem(STORAGE_KEY);
          if (mounted) setLoading(false);
          return;
        }

        if (mounted) setUser(parsedUser);
        const { data } = await apiServices.getMe();

        if (mounted) {
          persistUser({ ...parsedUser, ...data.data, token: parsedUser.token });
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const handleExpiry = () => {
      persistUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:expired', handleExpiry);

    return () => {
      mounted = false;
      window.removeEventListener('auth:expired', handleExpiry);
    };
  }, [persistUser]);

  const login = useCallback(async (email, password) => {
    const { data } = await apiServices.login({ email, password });
    persistUser(data.data);
    return data.data;
  }, [persistUser]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await apiServices.register({ name, email, password });
    persistUser(data.data);
    return data.data;
  }, [persistUser]);

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setUser: persistUser
    }),
    [user, loading, login, register, logout, persistUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
