import { useCallback, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import Toast from '../components/feedback/Toast.jsx';
import UpdatePrompt from '../components/pwa/UpdatePrompt.jsx';
import { useAnimals } from '../hooks/useAnimals.js';
import { useFavorites } from '../hooks/useFavorites.js';
import { useInstallPrompt } from '../hooks/useInstallPrompt.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import { usePersonalAnimals } from '../hooks/usePersonalAnimals.js';
import { AuthProvider } from '../auth/AuthContext.jsx';
import { AppDataContext } from './AppDataContext.jsx';
import EraPage from '../pages/Era.jsx';
import ExtinctDatabasePage from '../pages/ExtinctDatabase.jsx';
import EraGuessrPage from '../pages/EraGuessr.jsx';
import FavoritesPage from '../pages/Favorites.jsx';
import AboutPage from '../pages/About.jsx';
import AnimalDetailPage from '../pages/AnimalDetail.jsx';
import NotFoundPage from '../pages/NotFound.jsx';

export default function App() {
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const isOnline = useOnlineStatus();
  const catalog = useAnimals(isOnline);
  const favorites = useFavorites();
  const personal = usePersonalAnimals();
  const installPrompt = useInstallPrompt();
  const notify = useCallback((nextToast) => {
    window.clearTimeout(toastTimer.current);
    setToast(nextToast);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);
  const value = useMemo(() => ({
    animals: catalog.animals,
    loading: catalog.loading,
    error: catalog.error,
    fromCache: catalog.fromCache,
    reload: catalog.reload,
    favorites: favorites.favorites,
    favoriteError: favorites.error,
    toggleFavorite: favorites.toggleFavorite,
    removeFavorite: favorites.removeFavorite,
    updateNote: favorites.updateNote,
    personalAnimals: personal.animals,
    personalError: personal.error,
    createPersonalAnimal: personal.createAnimal,
    updatePersonalAnimal: personal.updateAnimal,
    deletePersonalAnimal: personal.deleteAnimal,
    isOnline,
    notify
  }), [catalog, favorites, personal, isOnline, notify]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppDataContext.Provider value={value}>
          <AppShell
            isOnline={isOnline}
            install={installPrompt.install}
            canInstall={installPrompt.canInstall}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/era" replace />} />
              <Route path="/era" element={<EraPage />} />
              <Route path="/database" element={<ExtinctDatabasePage />} />
              <Route path="/guessr" element={<EraGuessrPage />} />
              <Route path="/favorit" element={<FavoritesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/animal/:id" element={<AnimalDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppShell>
          <Toast toast={toast} onDismiss={() => setToast(null)} />
          <UpdatePrompt />
        </AppDataContext.Provider>
      </AuthProvider>
    </BrowserRouter>
  );
}
