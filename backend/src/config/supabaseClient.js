import { createClient } from '@supabase/supabase-js';

let client;

export function getSupabaseClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Backend Supabase config is missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return client;
}
