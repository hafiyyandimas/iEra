import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAppData } from '../app/AppDataContext.jsx';
import AnimalCard from '../components/animals/AnimalCard.jsx';
import AnimalForm from '../components/animals/AnimalForm.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/feedback/EmptyState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';

const extinctionYears = Array.from({ length: 25 }, (_, index) => 2001 + index);

export default function ExtinctDatabasePage() {
  const {
    animals, loading, error, reload, personalAnimals, personalError,
    createPersonalAnimal, updatePersonalAnimal, deletePersonalAnimal,
    favorites, toggleFavorite, removeFavorite, notify
  } = useAppData();
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.animalId)), [favorites]);
  const entries = useMemo(() => [...animals, ...personalAnimals]
    .filter((animal) => year === '' || Number(animal.extinction_year) === Number(year))
    .filter((animal) => {
      const normalized = search.trim().toLocaleLowerCase('id');
      return !normalized || `${animal.common_name} ${animal.scientific_name}`.toLocaleLowerCase('id').includes(normalized);
    }), [animals, personalAnimals, search, year]);

  const submitPersonalAnimal = (animal) => {
    const saved = editing
      ? updatePersonalAnimal(editing.id, animal)
      : createPersonalAnimal(animal);
    if (saved) {
      setFormOpen(false);
      setEditing(null);
      notify({ type: 'success', message: 'Data pribadi disimpan di perangkat ini.' });
    } else {
      notify({ type: 'error', message: personalError || 'Data tidak dapat disimpan di perangkat.' });
    }
  };

  const confirmDelete = () => {
    const removed = deletePersonalAnimal(deleteTarget.id);
    if (removed) removeFavorite(deleteTarget.id);
    setDeleteTarget(null);
    notify({ type: removed ? 'success' : 'error', message: removed ? 'Data pribadi dihapus dari perangkat.' : personalError || 'Data tidak dapat dihapus.' });
  };

  const handleFavorite = (animal) => {
    const saved = toggleFavorite(animal);
    notify({ type: saved ? 'success' : 'error', message: saved ? 'Koleksi favorit diperbarui di perangkat.' : 'Favorit tidak dapat disimpan.' });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">Katalog resmi dan koleksi lokal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Extinct Database</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Cari nama spesies atau saring berdasarkan tahun kepunahan. Data pribadi tetap tersimpan lokal dan terpisah dari katalog.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={16} /> Tambah spesies</Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-forest focus-within:ring-2 focus-within:ring-sage">
          <Search size={17} className="shrink-0 text-muted" />
          <span className="sr-only">Cari nama umum atau nama ilmiah</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama umum atau ilmiah…" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm focus-within:border-forest focus-within:ring-2 focus-within:ring-sage">
          <span className="sr-only">Filter tahun kepunahan</span>
          <select value={year} onChange={(event) => setYear(event.target.value)} className="w-full bg-transparent text-ink outline-none">
            <option value="">Semua tahun</option>
            {extinctionYears.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {personalError && <ErrorState message={personalError} />}
      {loading && animals.length === 0 ? <LoadingState label="Memuat database…" /> : entries.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {entries.map((animal) => (
            <div key={animal.id} className="space-y-2">
              <AnimalCard animal={animal} isFavorite={favoriteIds.has(animal.id)} onToggleFavorite={handleFavorite} />
              {animal.is_personal && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="min-h-9 px-3 text-xs" onClick={() => { setEditing(animal); setFormOpen(true); }}>Edit</Button>
                  <Button variant="danger" className="min-h-9 px-3 text-xs" onClick={() => setDeleteTarget(animal)}>Hapus data pribadi</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={search || year ? 'Tidak ada hasil yang cocok' : 'Database belum tersedia'}
          description={search || year ? 'Ubah kata pencarian atau pilih tahun lain.' : 'Katalog resmi akan muncul setelah API terhubung dan data tervalidasi tersedia.'}
        />
      )}

      {formOpen && <AnimalForm initialAnimal={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={submitPersonalAnimal} />}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus data pribadi?"
        description={`“${deleteTarget?.common_name || 'Spesies ini'}” akan dihapus dari penyimpanan lokal perangkat.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
