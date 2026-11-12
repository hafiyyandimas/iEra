import { apiClient, getUserRequestConfig } from './apiClient.js';

const favoriteFields = 'user_id,animal_id,note,created_at,updated_at,animal:animals(*)';

export async function fetchFavorites() {
  const config = await getUserRequestConfig();
  const response = await apiClient.get('/favorites', {
    ...config,
    params: {
      select: favoriteFields,
      order: 'created_at.desc'
    }
  });
  if (!Array.isArray(response.data)) throw new Error('Format data favorit tidak valid.');
  return response.data;
}

export async function upsertFavorite(userId, favorite) {
  const config = await getUserRequestConfig();
  await apiClient.post('/favorites', {
    user_id: userId,
    animal_id: favorite.animalId,
    note: favorite.note || ''
  }, {
    ...config,
    params: { on_conflict: 'user_id,animal_id' },
    headers: { ...config.headers, Prefer: 'resolution=merge-duplicates,return=minimal' }
  });
}

export async function deleteFavorite(userId, animalId) {
  const config = await getUserRequestConfig();
  await apiClient.delete('/favorites', {
    ...config,
    params: { user_id: `eq.${userId}`, animal_id: `eq.${animalId}` }
  });
}
