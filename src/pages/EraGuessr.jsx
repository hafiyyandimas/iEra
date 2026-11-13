import { useMemo, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppData } from '../app/AppDataContext.jsx';
import { getBirthYear } from '../utils/birthYear.js';
import AnimalCard from '../components/animals/AnimalCard.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import EmptyState from '../components/feedback/EmptyState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';

export default function EraGuessrPage() {
  const { animals, loading, error, reload, favorites, toggleFavorite, notify } = useAppData();
  const [age, setAge] = useState('');
  const [submittedAge, setSubmittedAge] = useState(null);
  const outcome = submittedAge === null ? null : getBirthYear(submittedAge);
  const matchingAnimals = useMemo(() => {
    if (!outcome?.valid) return [];
    return animals
      .filter((animal) => Number(animal.extinction_year) === outcome.birthYear)
      .sort((a, b) => a.common_name.localeCompare(b.common_name))
      .slice(0, 3);
  }, [animals, outcome]);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.animalId)), [favorites]);

  const submit = (event) => {
    event.preventDefault();
    setSubmittedAge(age);
  };
  const handleFavorite = (animal) => {
    const saved = toggleFavorite(animal);
    notify({ type: saved ? 'success' : 'error', message: saved ? 'Koleksi favorit diperbarui di perangkat.' : 'Favorit tidak dapat disimpan.' });
  };

  return (
    <section className="space-y-7">
      <header className="rounded-3xl bg-forest px-5 py-7 text-white sm:px-8 sm:py-9">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sage"><Sparkles size={15} /> Age Edition</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">EraGuessr</h1>
        <p className="mt-2 text-base text-white/85">Discover what disappeared in the year you were born.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_1.2fr]">
        <form onSubmit={submit} className="h-fit space-y-4 rounded-3xl border border-line bg-white p-5 sm:p-6">
          <div>
            <h2 className="font-bold">Berapa umurmu?</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Kami akan mencari catatan spesies pada perkiraan tahun kelahiranmu.</p>
          </div>
          <Input
            id="guessr-age"
            label="Umur (tahun)"
            type="number"
            min="1"
            step="1"
            required
            inputMode="numeric"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder="Masukkan umur"
          />
          <Button type="submit" className="w-full">Cari tahun lahir <ArrowRight size={16} /></Button>
          <p className="text-xs leading-relaxed text-muted">Tahun lahir hanya perkiraan karena tanggal ulang tahun tidak ditanyakan. Katalog mencakup 2001–2025.</p>
        </form>

        <div className="space-y-4">
          {error && <ErrorState message={error} onRetry={reload} />}
          {loading && animals.length === 0 && <LoadingState label="Memuat spesies…" />}
          {outcome && !outcome.valid && <ErrorState message={outcome.error} />}
          {outcome?.valid && (
            <>
              <div className="rounded-2xl bg-mist p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-forest">Perkiraan tahun lahir</p>
                <p className="mt-1 text-3xl font-bold text-ink">{outcome.birthYear}</p>
              </div>
              {loading && animals.length === 0 ? <LoadingState /> : matchingAnimals.length ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted">{matchingAnimals.length} spesies tercatat pada tahun ini.</p>
                  {matchingAnimals.map((animal) => <AnimalCard key={animal.id} animal={animal} isFavorite={favoriteIds.has(animal.id)} onToggleFavorite={handleFavorite} />)}
                </div>
              ) : (
                <EmptyState
                  title="Belum ada spesies tercatat pada tahun ini"
                  description="Coba jelajahi tahun lain di timeline atau cari seluruh katalog."
                  action={<div className="flex flex-wrap justify-center gap-2"><Button asChild variant="outline"><Link to="/era">Buka Era</Link></Button><Button asChild><Link to="/database">Buka database</Link></Button></div>}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
