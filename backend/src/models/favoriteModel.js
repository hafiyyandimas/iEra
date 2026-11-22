import { getSupabaseClient } from '../config/supabaseClient.js';

const FAVORITE_COLUMNS = 'animal_id, note, saved_at, updated_at';

function throwIfError(error) {
  if (!error) return;
  if (error.code === '23503') {
    const missingError = new Error('Spesies tidak ditemukan dalam katalog resmi.');
    missingError.status = 404;
    throw missingError;
  }
  const operationError = new Error('Database operation failed.');
  operationError.cause = error;
  throw operationError;
}

export async function listAccountFavorites(userId) {
  const { data, error } = await getSupabaseClient()
    .from('favorites')
    .select(FAVORITE_COLUMNS)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });
  throwIfError(error);
  return data || [];
}

export async function saveAccountFavorite({ userId, animalId, note, savedAt }) {
  const row = {
    user_id: userId,
    animal_id: animalId,
    note,
    updated_at: new Date().toISOString()
  };
  if (savedAt) row.saved_at = savedAt;

  const { data, error } = await getSupabaseClient()
    .from('favorites')
    .upsert(row, { onConflict: 'user_id,animal_id' })
    .select(FAVORITE_COLUMNS)
    .maybeSingle();
  throwIfError(error);
  return data;
}

export async function deleteAccountFavorite(userId, animalId) {
  const { data, error } = await getSupabaseClient()
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('animal_id', animalId)
    .select('animal_id')
    .maybeSingle();
  throwIfError(error);
  return data;
}

// Replaces the account set with the given catalog favorites. Personal animals
// never reach this function: they only exist on the device.
export async function replaceAccountFavorites({ userId, favorites }) {
  const client = getSupabaseClient();
  const rows = favorites.map((favorite) => ({
    user_id: userId,
    animal_id: favorite.animalId,
    note: favorite.note,
    saved_at: favorite.savedAt,
    updated_at: new Date().toISOString()
  }));

  if (rows.length) {
    const { error: upsertError } = await client
      .from('favorites')
      .upsert(rows, { onConflict: 'user_id,animal_id' });
    throwIfError(upsertError);
  }

  const keepIds = rows.map((row) => row.animal_id);
  let staleQuery = client.from('favorites').delete().eq('user_id', userId);
  if (keepIds.length) staleQuery = staleQuery.not('animal_id', 'in', `(${keepIds.join(',')})`);
  const { error: deleteError } = await staleQuery;
  throwIfError(deleteError);

  return listAccountFavorites(userId);
}
