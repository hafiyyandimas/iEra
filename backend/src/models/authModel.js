import { getSupabaseClient } from '../config/supabaseClient.js';

function throwIfError(error) {
  if (!error) return;
  if (error.code === '23505') {
    const conflictError = new Error('Username sudah digunakan.');
    conflictError.status = 409;
    throw conflictError;
  }
  const operationError = new Error('Database operation failed.');
  operationError.cause = error;
  throw operationError;
}

export async function createUser({ username, passwordHash }) {
  const { data, error } = await getSupabaseClient()
    .from('app_users')
    .insert({ username, password_hash: passwordHash })
    .select('id, username, role')
    .single();
  throwIfError(error);
  return data;
}

export async function findUserByUsername(username) {
  const { data, error } = await getSupabaseClient()
    .from('app_users')
    .select('id, username, password_hash, role')
    .eq('username', username)
    .maybeSingle();
  throwIfError(error);
  return data;
}

export async function createSession({ userId, tokenHash, expiresAt }) {
  const { error } = await getSupabaseClient()
    .from('auth_sessions')
    .insert({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt });
  throwIfError(error);
}

export async function findSessionByTokenHash(tokenHash) {
  const client = getSupabaseClient();
  const { data: session, error: sessionError } = await client
    .from('auth_sessions')
    .select('user_id, expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();
  throwIfError(sessionError);
  if (!session) return null;

  if (Date.parse(session.expires_at) <= Date.now()) {
    await deleteSession(tokenHash);
    return null;
  }

  const { data: user, error: userError } = await client
    .from('app_users')
    .select('id, username, role')
    .eq('id', session.user_id)
    .maybeSingle();
  throwIfError(userError);
  if (!user) return null;
  return { user, expiresAt: session.expires_at };
}

export async function deleteSession(tokenHash) {
  const { error } = await getSupabaseClient()
    .from('auth_sessions')
    .delete()
    .eq('token_hash', tokenHash);
  throwIfError(error);
}
