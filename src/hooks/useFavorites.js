import { useCallback, useEffect, useState } from 'react';
import { ensureAnonymousSession } from '../services/authService.js';
import { synchronizeFavorites } from '../services/syncService.js';
import { enqueue, getOutbox, removeOutboxEntry } from '../storage/favoritesOutbox.js';
import { getLocalFavorites, saveLocalFavorites } from '../storage/localCache.js';
import { getErrorMessage } from '../utils/errors.js';

export function useFavorites(isOnline) {
  const [favorites, setFavorites] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const restore = useCallback(() => {
    try {
      setFavorites(getLocalFavorites());
      setPendingCount(getOutbox().length);
      setError('');
    } catch (restoreError) {
      setError(getErrorMessage(restoreError));
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async () => {
    if (!isOnline) return;
    setError('');
    try {
      await ensureAnonymousSession();
      const result = await synchronizeFavorites();
      setFavorites(result.favorites);
      setPendingCount(result.pendingCount);
    } catch (syncError) {
      setError(getErrorMessage(syncError));
      try {
        setPendingCount(getOutbox().length);
      } catch (storageError) {
        setError(getErrorMessage(storageError));
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    restore();
    if (isOnline) sync();
  }, [isOnline, restore, sync]);

  const persist = useCallback((nextFavorites) => {
    saveLocalFavorites(nextFavorites);
    setFavorites(nextFavorites);
  }, []);

  const addFavorite = useCallback(async (animal) => {
    if (favorites.some((item) => item.animalId === animal.id)) return false;
    const favorite = { animalId: animal.id, animal, note: '', updatedAt: new Date().toISOString() };
    const next = [favorite, ...favorites];
    let queuedId;
    try {
      queuedId = enqueue({ type: 'upsert', favorite });
      persist(next);
      setPendingCount((count) => count + 1);
      if (isOnline) await sync();
      return true;
    } catch (operationError) {
      if (queuedId) removeOutboxEntry(queuedId);
      setError(getErrorMessage(operationError));
      restore();
      return false;
    }
  }, [favorites, isOnline, persist, restore, sync]);

  const updateNote = useCallback(async (animalId, note) => {
    const current = favorites.find((item) => item.animalId === animalId);
    if (!current) return false;
    const favorite = { ...current, note, updatedAt: new Date().toISOString() };
    const next = favorites.map((item) => item.animalId === animalId ? favorite : item);
    let queuedId;
    try {
      queuedId = enqueue({ type: 'upsert', favorite });
      persist(next);
      setPendingCount((count) => count + 1);
      if (isOnline) await sync();
      return true;
    } catch (operationError) {
      if (queuedId) removeOutboxEntry(queuedId);
      setError(getErrorMessage(operationError));
      restore();
      return false;
    }
  }, [favorites, isOnline, persist, restore, sync]);

  const removeFavorite = useCallback(async (animalId) => {
    const next = favorites.filter((item) => item.animalId !== animalId);
    let queuedId;
    try {
      queuedId = enqueue({ type: 'delete', animalId });
      persist(next);
      setPendingCount((count) => count + 1);
      if (isOnline) await sync();
      return true;
    } catch (operationError) {
      if (queuedId) removeOutboxEntry(queuedId);
      setError(getErrorMessage(operationError));
      restore();
      return false;
    }
  }, [favorites, isOnline, persist, restore, sync]);

  return { favorites, pendingCount, loading, error, addFavorite, updateNote, removeFavorite, sync };
}
