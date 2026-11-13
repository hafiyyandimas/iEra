import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient.js';
import { normalizeUsername, usernameToAuthEmail } from './username.js';

const AuthContext = createContext(null);
const configurationMessage = 'Autentikasi belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const applySession = useCallback(async (nextSession) => {
    const currentRequest = ++requestId.current;
    setSession(nextSession);
    setProfile(null);
    setError('');

    if (!nextSession?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('role, username')
        .eq('id', nextSession.user.id)
        .single();
      if (profileError) throw profileError;
      if (!['user', 'admin'].includes(data?.role)) {
        throw new Error('Role akun tidak valid. Hubungi administrator.');
      }
      if (requestId.current === currentRequest) {
        setProfile({ role: data.role, username: data.username || nextSession.user.user_metadata?.username || '' });
      }
    } catch (profileLoadError) {
      if (requestId.current === currentRequest) {
        setError(`Profil akun tidak dapat dimuat: ${profileLoadError.message}`);
      }
    } finally {
      if (requestId.current === currentRequest) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setError(configurationMessage);
      setLoading(false);
      return undefined;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      queueMicrotask(() => {
        if (active) void applySession(nextSession);
      });
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(`Sesi login tidak dapat diperiksa: ${sessionError.message}`);
        setLoading(false);
        return;
      }
      void applySession(data.session);
    }).catch((sessionError) => {
      if (!active) return;
      setError(`Sesi login tidak dapat diperiksa: ${sessionError.message}`);
      setLoading(false);
    });

    return () => {
      active = false;
      requestId.current += 1;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = useCallback(async (value, password) => {
    if (!supabase) throw new Error(configurationMessage);
    const username = normalizeUsername(value);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: usernameToAuthEmail(username),
      password
    });
    if (signInError) throw signInError;
  }, []);

  const signUp = useCallback(async (value, password) => {
    if (!supabase) throw new Error(configurationMessage);
    const username = normalizeUsername(value);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: usernameToAuthEmail(username),
      password,
      options: { data: { username } }
    });
    if (signUpError) throw signUpError;
    return { needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error(configurationMessage);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
  }, []);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    session,
    profile,
    loading,
    error,
    isConfigured: Boolean(supabase),
    signIn,
    signUp,
    signOut
  }), [session, profile, loading, error, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
