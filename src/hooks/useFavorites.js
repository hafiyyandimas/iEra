import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { getLocalFavorites, saveLocalFavorites } from '../storage/localCache.js';
import {
  deleteAccountFavorite,
  fetchAccountFavorites,
  pushAccountFavorite,
  replaceAccountFavorites
} from '../services/favoritesService.js';
import {
  isCatalogFavoriteId,
  mergeFavorites,
  normalizeFavorite,
  normalizeFavoriteNote
} from '../utils/favorites.js';

const SYNC_WARNING = 'Favorit tetap tersimpan di perangkat, tetapi belum tersinkron ke akun. Coba "Sinkronkan sekarang".';
const OFFLINE_WARNING = 'Kamu sedang offline. Favorit tersimpan di perangkat dan akan disinkronkan saat kembali online.';
const SESSION_WARNING = 'Sesi login berakhir. Masuk lagi untuk menyinkronkan favorit.';

function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

// Favorites always live on the device. When a user is signed in, every change
// is also mirrored to their account through the API.
export function useFavorites() {
  const { user } = useAuth();
  const userId = user?.id || null;
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const favoritesRef = useRef([]);
  const syncedUserRef = useRef(null);

  const applyFavorites = useCallback((next) => {
    favoritesRef.current = next;
    setFavorites(next);
  }, []);

  const persist = useCallback((next) => {
    try {
      saveLocalFavorites(next);
      applyFavorites(next);
      setError('');
      return true;
    } catch (saveError) {
      setError(saveError.message);
      return false;
    }
  }, [applyFavorites]);

  const reportSyncFailure = useCallback((syncError) => {
    if (isOffline()) {
      setError(OFFLINE_WARNING);
      return;
    }
    setError(syncError?.response?.status === 401 ? SESSION_WARNING : SYNC_WARNING);
  }, []);

  useEffect(() => {
    try {
      applyFavorites(getLocalFavorites());
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [applyFavorites]);

  const syncFavorites = useCallback(async () => {
    if (!userId) return false;
    if (isOffline()) {
      setError(OFFLINE_WARNING);
      return false;
    }

    setSyncing(true);
    try {
      const accountFavorites = await fetchAccountFavorites();
      const merged = mergeFavorites(favoritesRef.current, accountFavorites);
      await replaceAccountFavorites(merged.filter((favorite) => isCatalogFavoriteId(favorite.animalId)));
      saveLocalFavorites(merged);
      applyFavorites(merged);
      setError('');
      return true;
    } catch (syncError) {
      reportSyncFailure(syncError);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [applyFavorites, reportSyncFailure, userId]);

  useEffect(() => {
    if (!userId) {
      syncedUserRef.current = null;
      return;
    }
    if (syncedUserRef.current === userId) return;
    syncedUserRef.current = userId;
    void syncFavorites();
  }, [syncFavorites, userId]);

  const toggleFavorite = useCallback((animal) => {
    const current = favoritesRef.current;
    const existing = current.find((item) => item.animalId === animal.id);

    if (existing) {
      const saved = persist(current.filter((item) => item.animalId !== animal.id));
      if (saved && userId && isCatalogFavoriteId(animal.id)) {
        deleteAccountFavorite(animal.id).catch(reportSyncFailure);
      }
      return saved;
    }

    const created = normalizeFavorite({
      animalId: animal.id,
      note: '',
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    if (!created) {
      setError('Favorit tidak dapat disimpan.');
      return false;
    }

    const saved = persist([created, ...current]);
    if (saved && userId && isCatalogFavoriteId(created.animalId)) {
      pushAccountFavorite(created).catch(reportSyncFailure);
    }
    return saved;
  }, [persist, reportSyncFailure, userId]);

  const removeFavorite = useCallback((animalId) => {
    const saved = persist(favoritesRef.current.filter((item) => item.animalId !== animalId));
    if (saved && userId && isCatalogFavoriteId(animalId)) {
      deleteAccountFavorite(animalId).catch(reportSyncFailure);
    }
    return saved;
  }, [persist, reportSyncFailure, userId]);

  const updateNote = useCallback((animalId, note) => {
    const next = favoritesRef.current.map((item) => (item.animalId === animalId
      ? { ...item, note: normalizeFavoriteNote(note), updatedAt: new Date().toISOString() }
      : item));
    const saved = persist(next);
    const target = next.find((item) => item.animalId === animalId);
    if (saved && target && userId && isCatalogFavoriteId(animalId)) {
      pushAccountFavorite(target).catch(reportSyncFailure);
    }
    return saved;
  }, [persist, reportSyncFailure, userId]);

  return { favorites, error, syncing, toggleFavorite, removeFavorite, updateNote, syncFavorites };
}
