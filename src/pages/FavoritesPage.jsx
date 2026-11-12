import { useCallback, useMemo, useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import FavoriteCard from '../components/favorites/FavoriteCard.jsx';
import AddFavoriteModal from '../components/favorites/AddFavoriteModal.jsx';
import EmptyState from '../components/feedback/EmptyState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Button from '../components/ui/Button.jsx';

export default function FavoritesPage({ favorites, animals, loading, error, pendingCount, onAdd, onSaveNote, onDelete, onSync, notify }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.animalId)), [favorites]);

  const addFromModal = async (animal) => {
    const added = await onAdd(animal);
    if (added) {
      notify({ type: 'success', message: `${animal.common_name} ditambahkan ke favorit.` });
      closeModal();
    } else {
      notify({ type: 'error', message: 'Favorit belum dapat disimpan. Periksa notifikasi sinkronisasi.' });
    }
  };

  const saveNote = async (animalId, note) => {
    const saved = await onSaveNote(animalId, note);
    notify(saved
      ? { type: 'success', message: 'Catatan disimpan pada perangkat dan antrean sinkronisasi.' }
      : { type: 'error', message: 'Catatan belum dapat disimpan.' });
  };

  const confirmDelete = async () => {
    const removed = await onDelete(deleteTarget.animalId);
    setDeleteTarget(null);
    notify(removed
      ? { type: 'success', message: 'Favorit dihapus dari perangkat dan antrean sinkronisasi.' }
      : { type: 'error', message: 'Favorit belum berhasil dihapus.' });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-forest"><Heart size={14} /> Koleksi pribadi</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Favorit</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">Simpan spesies dan tambahkan catatan yang hanya terikat pada sesi kamu.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus size={17} /> Tambah favorit</Button>
      </header>

      {pendingCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage bg-sage/35 px-4 py-3">
          <p className="text-sm text-forest">{pendingCount} perubahan menunggu sinkronisasi.</p>
          <Button variant="outline" className="min-h-9 px-3 text-xs" onClick={onSync}>Sinkronkan sekarang</Button>
        </div>
      )}
      {error && <ErrorState message={error} onRetry={onSync} />}
      {loading && favorites.length === 0 ? <LoadingState label="Memuat favorit…" /> : (
        favorites.length
          ? <div className="grid gap-4">{favorites.map((favorite) => (
            <FavoriteCard key={favorite.animalId} favorite={favorite} onSaveNote={saveNote} onRequestDelete={setDeleteTarget} />
          ))}</div>
          : <EmptyState
            title="Koleksimu masih kosong"
            description="Tambahkan spesies dari hasil pencarian atau pilih langsung dari katalog yang tersimpan."
            action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Pilih spesies</Button>}
          />
      )}

      <AddFavoriteModal open={isModalOpen} animals={animals} favoriteIds={favoriteIds} onClose={closeModal} onAdd={addFromModal} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus dari favorit?"
        description={`“${deleteTarget?.animal?.common_name || 'Spesies ini'}” akan dihapus dari koleksi di perangkat dan disinkronkan saat koneksi tersedia.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
