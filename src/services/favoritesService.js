import { apiClient } from './apiClient.js';

function unwrap(response) {
  if (!response.data?.success) throw new Error(response.data?.error || 'Respons API tidak valid.');
  return response.data.data;
}

export async function fetchAccountFavorites() {
  const response = await apiClient.get('/favorites');
  const data = unwrap(response);
  if (!Array.isArray(data)) throw new Error('Format favorit akun tidak valid.');
  return data;
}

export async function pushAccountFavorite(favorite) {
  const response = await apiClient.put(`/favorites/${encodeURIComponent(favorite.animalId)}`, {
    note: favorite.note,
    savedAt: favorite.savedAt
  });
  return unwrap(response);
}

export async function deleteAccountFavorite(animalId) {
  const response = await apiClient.delete(`/favorites/${encodeURIComponent(animalId)}`);
  return unwrap(response);
}

export async function replaceAccountFavorites(favorites) {
  const response = await apiClient.put('/favorites', {
    favorites: favorites.map(({ animalId, note, savedAt }) => ({ animalId, note, savedAt }))
  });
  return unwrap(response);
}
