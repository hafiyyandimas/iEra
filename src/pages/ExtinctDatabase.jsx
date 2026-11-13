import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAppData } from '../app/AppDataContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import AnimalCard from '../components/animals/AnimalCard.jsx';
import AnimalForm from '../components/animals/AnimalForm.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/feedback/EmptyState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import { getApiError } from '../services/apiClient.js';
import { createOfficialAnimal } from '../services/animalService.js';

const extinctionYears = Array.from({ length: 25 }, (_, index) => 2001 + index);

export default function ExtinctDatabasePage() {
  const { animals, loading, error, reload, favorites, toggleFavorite, notify } = useAppData();
  const { profile, session } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.animalId)), [favorites]);
  const entries = useMemo(() => animals
    .filter((animal) => year === '' || Number(animal.extinction_year) === Number(year))
    .filter((animal) => {
      const normalized = search.trim().toLocaleLowerCase('id');
      return !normalized || `${animal.common_name} ${animal.scientific_name}`.toLocaleLowerCase('id').includes(normalized);
    }), [animals, search, year]);

  const submitOfficialAnimal = async (animal) => {
    try {
      await createOfficialAnimal(animal, session?.access_token);
      await reload();
      setFormOpen(false);
      notify({ type: 'success', message: 'Spesies ditambahkan ke katalog resmi.' });
    } catch (saveError) {
      throw new Error(getApiError(saveError));
    }
  };

  const handleFavorite = (animal) => {
    const saved = toggleFavorite(animal);
    notify({ type: saved ? 'success' : 'error', message: saved ? 'Koleksi favorit diperbarui di perangkat.' : 'Favorit tidak dapat disimpan.' });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">Katalog resmi</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Extinct Database</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Cari nama spesies atau saring berdasarkan tahun kepunahan. Semua pengunjung dapat menjelajah; hanya admin yang dapat menambahkan spesies ke katalog resmi.</p>
        </div>
        {isAdmin && <Button onClick={() => setFormOpen(true)}><Plus size={16} /> Tambah spesies</Button>}
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
      {loading && animals.length === 0 ? <LoadingState label="Memuat database…" /> : entries.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {entries.map((animal) => (
            <div key={animal.id}>
              <AnimalCard animal={animal} isFavorite={favoriteIds.has(animal.id)} onToggleFavorite={handleFavorite} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={search || year ? 'Tidak ada hasil yang cocok' : 'Database belum tersedia'}
          description={search || year ? 'Ubah kata pencarian atau pilih tahun lain.' : 'Katalog resmi akan muncul setelah API terhubung dan data tervalidasi tersedia.'}
        />
      )}

      {formOpen && isAdmin && <AnimalForm onClose={() => setFormOpen(false)} onSubmit={submitOfficialAnimal} />}
    </section>
  );
}
