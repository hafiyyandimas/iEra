import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import EmptyState from '../feedback/EmptyState.jsx';

export default function AddFavoriteModal({ open, animals, favoriteIds, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);
  const choices = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('id');
    return animals.filter((animal) => !favoriteIds.has(animal.id)
      && (!normalized || `${animal.common_name} ${animal.scientific_name}`.toLocaleLowerCase('id').includes(normalized)));
  }, [animals, favoriteIds, query]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="add-favorite-title" className="max-h-[88vh] w-full max-w-xl overflow-hidden rounded-t-3xl bg-paper sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 id="add-favorite-title" className="font-bold text-ink">Tambah favorit</h2>
            <p className="mt-0.5 text-xs text-muted">Pilih dari katalog yang tersedia di perangkat.</p>
          </div>
          <button aria-label="Tutup" onClick={onClose} className="grid size-10 place-items-center rounded-xl text-muted hover:bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest"><X size={19} /></button>
        </div>
        <div className="border-b border-line px-5 py-4">
          <label htmlFor="animal-search" className="sr-only">Cari spesies</label>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3">
            <Search size={17} className="text-muted" />
            <input id="animal-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama spesies…" className="min-h-11 w-full bg-transparent text-sm outline-none" />
          </div>
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
          {choices.length === 0
            ? <EmptyState title={animals.length ? 'Tidak ada spesies ditemukan' : 'Katalog belum tersedia'} description={animals.length ? 'Coba kata kunci lain, atau semua data sudah menjadi favorit.' : 'Muat katalog dari Supabase agar spesies bisa dipilih.'} />
            : choices.map((animal) => (
              <div key={animal.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                <img src={animal.image_url} alt="" className="size-14 rounded-xl bg-mist object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/animal-placeholder.svg'; }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{animal.common_name}</p>
                  <p className="truncate text-xs italic text-muted">{animal.scientific_name} · {animal.extinction_year}</p>
                </div>
                <Button className="min-h-9 px-3 text-xs" onClick={() => onAdd(animal)}>Tambah</Button>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
