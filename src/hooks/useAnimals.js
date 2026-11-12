import { useCallback, useEffect, useState } from 'react';
import { fetchAnimals } from '../services/animalService.js';
import { cacheAnimals, getCachedAnimals } from '../storage/localCache.js';
import { getErrorMessage } from '../utils/errors.js';

export function useAnimals(isOnline) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const cached = getCachedAnimals();
      if (cached) {
        setAnimals(cached);
        setFromCache(true);
      }
      if (!isOnline) {
        if (!cached) setError('Belum ada katalog tersimpan. Sambungkan internet untuk memuat data.');
        return;
      }
      const result = await fetchAnimals();
      cacheAnimals(result);
      setAnimals(result);
      setFromCache(false);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      if (!animals.length) {
        try {
          const cached = getCachedAnimals();
          if (cached) {
            setAnimals(cached);
            setFromCache(true);
          }
        } catch (cacheError) {
          setError(getErrorMessage(cacheError));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => { load(); }, [load]);
  return { animals, loading, error, fromCache, reload: load };
}
