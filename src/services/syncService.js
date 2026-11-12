import { supabase } from '../config/supabase.js';
import { ensureAnonymousSession } from './authService.js';
import { deleteFavorite, fetchFavorites, upsertFavorite } from './favoriteService.js';
import { getOutbox, removeOutboxEntry } from '../storage/favoritesOutbox.js';
import { getLocalFavorites, saveLocalFavorites } from '../storage/localCache.js';

let activeSync;

export function synchronizeFavorites() {
  if (activeSync) return activeSync;
  activeSync = performSync().finally(() => { activeSync = null; });
  return activeSync;
}

async function performSync() {
  const session = await ensureAnonymousSession();
  const userId = session.user.id;

  for (const operation of getOutbox()) {
    if (operation.type === 'upsert') {
      await upsertFavorite(userId, operation.favorite);
    } else if (operation.type === 'delete') {
      await deleteFavorite(userId, operation.animalId);
    } else {
      throw new Error('Jenis perubahan favorit tidak dikenal; antrean tidak dihapus.');
    }
    removeOutboxEntry(operation.id);
  }

  const serverRows = await fetchFavorites();
  const pending = getOutbox();
  const pendingIds = new Set(pending.map((item) => item.type === 'delete'
    ? item.animalId
    : item.favorite.animalId));
  const localRows = getLocalFavorites();
  const serverMapped = serverRows
    .filter((row) => row.animal && !pendingIds.has(row.animal_id))
    .map((row) => ({
      animalId: row.animal_id,
      animal: row.animal,
      note: row.note || '',
      updatedAt: row.updated_at
    }));
  const merged = new Map(serverMapped.map((favorite) => [favorite.animalId, favorite]));
  for (const favorite of localRows) {
    if (pendingIds.has(favorite.animalId)) merged.set(favorite.animalId, favorite);
  }
  saveLocalFavorites([...merged.values()]);
  return { userId, favorites: [...merged.values()], pendingCount: getOutbox().length };
}
