import { useState } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import Toast from '../components/feedback/Toast.jsx';
import UpdatePrompt from '../components/pwa/UpdatePrompt.jsx';
import HomePage from '../pages/HomePage.jsx';
import FavoritesPage from '../pages/FavoritesPage.jsx';
import AboutPage from '../pages/AboutPage.jsx';
import { useAnimals } from '../hooks/useAnimals.js';
import { useFavorites } from '../hooks/useFavorites.js';
import { useInstallPrompt } from '../hooks/useInstallPrompt.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState(null);
  const isOnline = useOnlineStatus();
  const animalState = useAnimals(isOnline);
  const favoriteState = useFavorites(isOnline);
  const installPrompt = useInstallPrompt();
  const notify = (nextToast) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 4200);
  };

  let page;
  if (activeTab === 'favorites') {
    page = <FavoritesPage
      favorites={favoriteState.favorites}
      animals={animalState.animals}
      loading={favoriteState.loading}
      error={favoriteState.error}
      pendingCount={favoriteState.pendingCount}
      onAdd={favoriteState.addFavorite}
      onSaveNote={favoriteState.updateNote}
      onDelete={favoriteState.removeFavorite}
      onSync={favoriteState.sync}
      notify={notify}
    />;
  } else if (activeTab === 'about') {
    page = <AboutPage />;
  } else {
    page = <HomePage
      {...animalState}
      favorites={favoriteState.favorites}
      onAddFavorite={favoriteState.addFavorite}
      notify={notify}
    />;
  }

  return (
    <>
      <AppShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOnline={isOnline}
        install={installPrompt.install}
        canInstall={installPrompt.canInstall}
      >
        {page}
      </AppShell>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <UpdatePrompt />
    </>
  );
}
