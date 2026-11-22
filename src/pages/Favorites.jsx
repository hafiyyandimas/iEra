import { useEffect, useMemo, useState } from 'react';
import { Heart, RefreshCw, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppData } from '../app/AppDataContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import AnimalCard from '../components/animals/AnimalCard.jsx';
import EmptyState from '../components/feedback/EmptyState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Button from '../components/ui/Button.jsx';

function FavoriteNote({ favorite, onSave }) {
  const [note, setNote] = useState(favorite.note || '');
  useEffect(() => setNote(favorite.note || ''), [favorite.note]);
  return (
    <div className="mt-3 border-t border-line pt-3">
      <label htmlFor={`favorite-note-${favorite.animalId}`} className="text-xs font-semibold">Catatan pribadi</label>
      <textarea
        id={`favorite-note-${favorite.animalId}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={500}
        rows={2}
        placeholder="Tulis catatan untuk dirimu…"
        className="mt-2 w-full resize-y rounded-xl border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-sage"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <Link to={`/animal/${encodeURIComponent(favorite.animalId)}`} className="text-xs font-medium text-forest underline underline-offset-2">Buka detail</Link>
        <Button variant="outline" className="min-h-9 px-3 text-xs" onClick={() => onSave(favorite.animalId, note)}><Save size={14} /> Simpan catatan</Button>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const {
    animals,
    personalAnimals,
    favorites,
    favoriteError,
    favoriteSyncing,
    updateNote,
    removeFavorite,
    syncFavorites,
    notify
  } = useAppData();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const animalMap = useMemo(() => new Map([...animals, ...personalAnimals].map((animal) => [animal.id, animal])), [animals, personalAnimals]);
  const favoriteItems = favorites.map((favorite) => ({ favorite, animal: animalMap.get(favorite.animalId) }));

  const saveNote = (animalId, note) => {
    const saved = updateNote(animalId, note);
    const destination = user ? 'perangkat dan akun' : 'perangkat ini';
    notify({ type: saved ? 'success' : 'error', message: saved ? `Catatan disimpan di ${destination}.` : 'Catatan tidak dapat disimpan.' });
  };
  const confirmDelete = () => {
    const removed = removeFavorite(deleteTarget.animalId);
    setDeleteTarget(null);
    notify({ type: removed ? 'success' : 'error', message: removed ? 'Favorit dihapus.' : 'Favorit tidak dapat dihapus.' });
  };
  const handleSync = async () => {
    const synced = await syncFavorites();
    notify({ type: synced ? 'success' : 'error', message: synced ? 'Favorit disinkronkan dengan akun.' : 'Sinkronisasi akun gagal. Coba lagi.' });
  };

  return (
    <section className="space-y-6">
      <header>
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-forest"><Heart size={14} /> Koleksi favorit</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Favorit</h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
          {user
            ? `Favorit dan catatan tersimpan di perangkat ini dan di akun @${user.username}.`
            : 'Favorit dan catatan tersimpan di perangkat ini. Masuk agar ikut tersimpan di akun.'}
        </p>
        {user && (
          <Button variant="outline" className="mt-3 min-h-9 px-3 text-xs" onClick={handleSync} disabled={favoriteSyncing}>
            <RefreshCw size={14} /> {favoriteSyncing ? 'Menyinkronkan…' : 'Sinkronkan sekarang'}
          </Button>
        )}
      </header>
      {favoriteError && <ErrorState message={favoriteError} />}
      {favoriteItems.length ? (
        <div className="grid gap-4">
          {favoriteItems.map(({ favorite, animal }, index) => (
            <article key={favorite.animalId} style={{ '--i': index }} className="enter-up rounded-2xl border border-line bg-white p-3 sm:p-4">
              {animal ? <AnimalCard animal={animal} isFavorite onToggleFavorite={() => setDeleteTarget(favorite)} /> : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted">Spesies favorit tidak tersedia dalam katalog lokal.</p>
                  <Button variant="danger" className="min-h-9 px-3 text-xs" onClick={() => setDeleteTarget(favorite)}>Hapus</Button>
                </div>
              )}
              {animal && <FavoriteNote favorite={favorite} onSave={saveNote} />}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada spesies favorit" description="Simpan spesies dari halaman Era, Extinct Database, atau detail spesies." action={<Button asChild><Link to="/database">Jelajahi katalog</Link></Button>} />
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus dari favorit?"
        description={user ? 'Favorit dan catatannya akan dihapus dari perangkat ini dan akun.' : 'Favorit dan catatannya akan dihapus dari penyimpanan lokal perangkat.'}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
