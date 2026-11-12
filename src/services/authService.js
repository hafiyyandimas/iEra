import { getSupabaseConfigError, hasSupabaseConfig, supabase } from '../config/supabase.js';

export async function ensureAnonymousSession() {
  if (!hasSupabaseConfig || !supabase) throw getSupabaseConfigError();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session) return data.session;

  const result = await supabase.auth.signInAnonymously();
  if (result.error) throw result.error;
  if (!result.data.session) throw new Error('Supabase tidak mengembalikan sesi pengguna.');
  return result.data.session;
}
