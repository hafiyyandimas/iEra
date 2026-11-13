import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../app/AppDataContext.jsx';
import { getBirthYear } from '../utils/birthYear.js';
import AnimalCard from '../components/animals/AnimalCard.jsx';
import Button from '../components/ui/Button.jsx';
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
    <section className="relative min-h-[65vh] pb-10 lg:min-h-[min(72vh,44rem)]">
      <form
        onSubmit={submit}
        className={`mx-auto w-full max-w-sm rounded-3xl border border-line bg-white p-6 text-center shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:absolute lg:top-1/2 lg:-translate-y-1/2 ${outcome?.valid ? 'lg:left-0 lg:mx-0 lg:max-w-[34%] lg:translate-x-0' : 'lg:left-1/2 lg:-translate-x-1/2'}`}
      >
        <h1 className="text-2xl font-bold tracking-tight">Masukkan umur</h1>
        <label htmlFor="guessr-age" className="sr-only">Umur dalam tahun</label>
        <input
          id="guessr-age"
          type="number"
          min="1"
          step="1"
          required
          inputMode="numeric"
          value={age}
          onChange={(event) => setAge(event.target.value)}
          placeholder="Contoh: 20"
          className="mt-5 min-h-12 w-full rounded-xl border border-line bg-paper px-4 text-center text-lg outline-none transition focus:border-forest focus:ring-2 focus:ring-sage"
        />
        <Button type="submit" className="mt-4 w-full">Go!</Button>
        {outcome && !outcome.valid && <div className="mt-4 text-left"><ErrorState message={outcome.error} /></div>}
      </form>

      {outcome?.valid && (
        <div className="guessr-results-enter mt-8 space-y-4 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-[60%] lg:overflow-y-auto lg:py-8">
          {error && <ErrorState message={error} onRetry={reload} />}
          {loading && animals.length === 0 ? <LoadingState label="Memuat spesies…" /> : (
            <>
              <header className="rounded-2xl bg-mist p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-forest">Spesies yang tercatat punah pada tahun</p>
                <p className="mt-1 text-3xl font-bold text-ink">{outcome.birthYear}</p>
              </header>
              {matchingAnimals.length ? (
                <div className="space-y-3">
                  {matchingAnimals.map((animal) => <AnimalCard key={animal.id} animal={animal} isFavorite={favoriteIds.has(animal.id)} onToggleFavorite={handleFavorite} />)}
                </div>
              ) : (
                <EmptyState
                  title="Belum ada spesies tercatat pada tahun ini"
                  description="Tahun lahir merupakan perkiraan; katalog mencakup tahun 2001–2025."
                  action={<div className="flex flex-wrap justify-center gap-2"><Button asChild variant="outline"><Link to="/era">Buka Era</Link></Button><Button asChild><Link to="/database">Buka database</Link></Button></div>}
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
