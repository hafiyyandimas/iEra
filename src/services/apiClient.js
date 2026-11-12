import axios from 'axios';
import { getSupabaseConfigError, hasSupabaseConfig, supabase } from '../config/supabase.js';

export const apiClient = axios.create({
  timeout: 12000,
  headers: { Accept: 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  if (!hasSupabaseConfig) throw getSupabaseConfigError();
  config.baseURL = `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;
  config.headers.set('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
  return config;
});

export async function getUserRequestConfig() {
  if (!supabase) throw getSupabaseConfigError();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error('Sesi belum siap. Periksa koneksi lalu coba lagi.');
  return { headers: { Authorization: `Bearer ${token}` } };
}
