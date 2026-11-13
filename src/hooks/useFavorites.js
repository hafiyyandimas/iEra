import { useCallback, useEffect, useState } from 'react';
import { getLocalFavorites, saveLocalFavorites } from '../storage/localCache.js';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setFavorites(getLocalFavorites());
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  const commit = useCallback((next) => {
    try {
      saveLocalFavorites(next);
      setFavorites(next);
      setError('');
      return true;
    } catch (saveError) {
      setError(saveError.message);
      return false;
    }
  }, []);

  const toggleFavorite = useCallback((animal) => {
    const existing = favorites.find((item) => item.animalId === animal.id);
    if (existing) {
      return commit(favorites.filter((item) => item.animalId !== animal.id));
    }
    return commit([{
      animalId: animal.id,
      note: '',
      savedAt: new Date().toISOString()
    }, ...favorites]);
  }, [commit, favorites]);

  const removeFavorite = useCallback((animalId) => (
    commit(favorites.filter((item) => item.animalId !== animalId))
  ), [commit, favorites]);

  const updateNote = useCallback((animalId, note) => (
    commit(favorites.map((item) => item.animalId === animalId ? { ...item, note } : item))
  ), [commit, favorites]);

  return { favorites, error, toggleFavorite, removeFavorite, updateNote };
}
