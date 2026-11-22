import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { useAppData } from '../app/AppDataContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import AnimalCard from '../components/animals/AnimalCard.jsx';
import AnimalForm from '../components/animals/AnimalForm.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/feedback/EmptyState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import SkeletonCards from '../components/feedback/SkeletonCards.jsx';
import { getApiError } from '../services/apiClient.js';
import { createOfficialAnimal } from '../services/animalService.js';

const extinctionYears = Array.from({ length: 25 }, (_, index) => 2001 + index);
const PAGE_SIZE = 10;

export default function ExtinctDatabasePage() {
  const { animals, loading, error, reload, favorites, toggleFavorite, notify } = useAppData();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const resultsRef = useRef(null);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.animalId)), [favorites]);
  const entries = useMemo(() => animals
    .filter((animal) => year === '' || Number(animal.extinction_year) === Number(year))
    .filter((animal) => {
      const normalized = search.trim().toLocaleLowerCase('id');
      return !normalized || `${animal.common_name} ${animal.scientific_name}`.toLocaleLowerCase('id').includes(normalized);
    }), [animals, search, year]);
  const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageEntries = entries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = entries.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, entries.length);

  const filterBy = (nextSearch, nextYear) => {
    setSearch(nextSearch);
    setYear(nextYear);
    setPage(1);
  };

  const goToPage = (next) => {
    const target = Math.min(Math.max(next, 1), pageCount);
    if (target === currentPage) return;
    setPage(target);
    resultsRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  };

  const submitOfficialAnimal = async (animal) => {
    try {
      await createOfficialAnimal(animal);
      await reload();
      setFormOpen(false);
      notify({ type: 'success', message: 'Spesies ditambahkan ke katalog resmi.' });
    } catch (saveError) {
      throw new Error(getApiError(saveError));
    }
  };

  const handleFavorite = (animal) => {
    const saved = toggleFavorite(animal);
    notify({ type: saved ? 'success' : 'error', message: saved ? 'Koleksi favorit diperbarui.' : 'Favorit tidak dapat disimpan.' });
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
        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-line bg-white px-3 transition-shadow focus-within:border-forest focus-within:ring-2 focus-within:ring-sage">
          <Search size={17} className="shrink-0 text-muted" />
          <span className="sr-only">Cari nama umum atau nama ilmiah</span>
          <input value={search} onChange={(event) => filterBy(event.target.value, year)} placeholder="Cari nama umum atau ilmiah…" className="w-full bg-transparent text-sm outline-none" />
          {search && (
            <button type="button" aria-label="Hapus pencarian" onClick={() => filterBy('', year)} className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-mist hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest">
              <X size={15} />
            </button>
          )}
        </label>
        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm transition-shadow focus-within:border-forest focus-within:ring-2 focus-within:ring-sage">
          <span className="sr-only">Filter tahun kepunahan</span>
          <select value={year} onChange={(event) => filterBy(search, event.target.value)} className="w-full bg-transparent text-ink outline-none">
            <option value="">Semua tahun</option>
            {extinctionYears.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>

      {!loading && animals.length > 0 && (
        <div ref={resultsRef} className="scroll-mt-24 flex flex-wrap items-center justify-between gap-2 text-xs text-muted" aria-live="polite">
          <p>
            {entries.length
              ? <>Menampilkan <strong className="font-semibold tabular-nums text-forest">{rangeStart}–{rangeEnd}</strong> dari <span className="tabular-nums">{entries.length}</span> spesies</>
              : 'Tidak ada spesies yang cocok dengan filter ini.'}
          </p>
          {(search || year) && (
            <button type="button" onClick={() => filterBy('', '')} className="rounded-full bg-mist px-3 py-1 font-medium text-forest transition-colors hover:bg-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest">Reset filter</button>
          )}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && animals.length === 0 ? <SkeletonCards count={4} label="Memuat database…" /> : entries.length ? (
        <div key={`${search}|${year}|${currentPage}`} className="grid gap-3 lg:grid-cols-2">
          {pageEntries.map((animal, index) => (
            <div key={animal.id}>
              <AnimalCard animal={animal} index={index} isFavorite={favoriteIds.has(animal.id)} onToggleFavorite={handleFavorite} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={search || year ? 'Tidak ada hasil yang cocok' : 'Database belum tersedia'}
          description={search || year ? 'Ubah kata pencarian atau pilih tahun lain.' : 'Katalog resmi akan muncul setelah API terhubung dan data tervalidasi tersedia.'}
        />
      )}

      {!loading && pageCount > 1 && (
        <nav aria-label="Navigasi halaman katalog" className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-white px-2 py-2">
          <Button variant="outline" aria-label="Halaman sebelumnya" className="!min-h-11 px-3 text-xs" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
            <ChevronLeft size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>
          <p className="text-xs text-muted">Halaman <strong className="font-semibold tabular-nums text-forest">{currentPage}</strong> dari <span className="tabular-nums">{pageCount}</span></p>
          <Button variant="outline" aria-label="Halaman berikutnya" className="!min-h-11 px-3 text-xs" disabled={currentPage === pageCount} onClick={() => goToPage(currentPage + 1)}>
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </nav>
      )}

      {formOpen && isAdmin && <AnimalForm onClose={() => setFormOpen(false)} onSubmit={submitOfficialAnimal} />}
    </section>
  );
}
