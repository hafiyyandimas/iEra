import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : null;

export function getSupabaseConfigError() {
  return new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
}
