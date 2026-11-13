import { useCallback, useEffect, useState } from 'react';
import { fetchAnimals } from '../services/animalService.js';
import { cacheAnimals, getCachedAnimals } from '../storage/localCache.js';
import { getApiError } from '../services/apiClient.js';

export function useAnimals(isOnline) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    let cached = null;
    try {
      cached = getCachedAnimals();
      if (cached) {
        setAnimals(cached);
        setFromCache(true);
      }
      if (!isOnline) {
        if (!cached) setError('Belum ada katalog tersimpan. Sambungkan internet untuk memuat data.');
        return;
      }
      const result = await fetchAnimals();
      setAnimals(result);
      setFromCache(false);
      try {
        cacheAnimals(result);
      } catch (cacheError) {
        setError(cacheError.message);
      }
    } catch (loadError) {
      setError(getApiError(loadError));
      if (cached) setFromCache(true);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => { load(); }, [load]);
  return { animals, loading, error, fromCache, reload: load };
}
