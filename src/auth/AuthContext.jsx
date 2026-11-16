import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { normalizeUsername } from './username.js';
import { apiClient } from '../services/apiClient.js';

const AuthContext = createContext(null);

function getAuthError(error) {
  if (error?.response?.data?.error) return error.response.data.error;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'Koneksi internet diperlukan untuk autentikasi.';
  return 'Server autentikasi tidak dapat dihubungi.';
}

function getUserFromResponse(response) {
  const user = response.data?.success && response.data?.data?.user;
  if (!user || typeof user.id !== 'string' || typeof user.username !== 'string' || !['user', 'admin'].includes(user.role)) {
    throw new Error('Respons autentikasi tidak valid.');
  }
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiClient.get('/auth/me').then((response) => {
      if (!active) return;
      const currentUser = getUserFromResponse(response);
      setUser(currentUser);
      setProfile(currentUser);
      setError('');
    }).catch((sessionError) => {
      if (!active) return;
      if (sessionError.response?.status !== 401) setError(getAuthError(sessionError));
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (value, password) => {
    try {
      const username = normalizeUsername(value);
      const response = await apiClient.post('/auth/login', { username, password });
      const authenticatedUser = getUserFromResponse(response);
      setUser(authenticatedUser);
      setProfile(authenticatedUser);
      setError('');
    } catch (signInError) {
      throw new Error(signInError.response || signInError.request ? getAuthError(signInError) : signInError.message);
    }
  }, []);

  const signUp = useCallback(async (value, password) => {
    try {
      const username = normalizeUsername(value);
      const response = await apiClient.post('/auth/register', { username, password });
      const authenticatedUser = getUserFromResponse(response);
      setUser(authenticatedUser);
      setProfile(authenticatedUser);
      setError('');
    } catch (signUpError) {
      throw new Error(signUpError.response || signUpError.request ? getAuthError(signUpError) : signUpError.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
      setUser(null);
      setProfile(null);
      setError('');
    } catch (signOutError) {
      throw new Error(getAuthError(signOutError));
    }
  }, []);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut
  }), [user, profile, loading, error, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
