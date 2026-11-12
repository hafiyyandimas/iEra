import { useMemo, useState } from 'react';
import { ArrowDown, Leaf, Search } from 'lucide-react';
import { DATASET_MAX_YEAR, DATASET_MIN_YEAR, MAX_RESULTS } from '../app/appConfig.js';
import { getBirthYear } from '../utils/birthYear.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import AnimalList from '../components/animals/AnimalList.jsx';

export default function HomePage({ animals, loading, error, fromCache, reload, favorites, onAddFavorite, notify }) {
  const [age, setAge] = useState('');
  const [searched, setSearched] = useState(false);
  const [validationError, setValidationError] = useState('');
  const result = useMemo(() => getBirthYear(age), [age]);
  const matches = useMemo(() => {
    if (!searched || !result.valid) return [];
    return animals
      .filter((animal) => Number(animal.extinction_year) === result.birthYear)
      .sort((a, b) => Number(a.slot) - Number(b.slot))
      .slice(0, MAX_RESULTS);
  }, [animals, result, searched]);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.animalId)), [favorites]);

  const submit = (event) => {
    event.preventDefault();
    setSearched(true);
    setValidationError(result.valid ? '' : result.error);
  };

  const add = async (animal) => {
    const added = await onAddFavorite(animal);
    notify(added
      ? { type: 'success', message: `${animal.common_name} ditambahkan ke favorit.` }
      : { type: 'error', message: 'Spesies sudah menjadi favorit atau perubahan belum dapat disimpan.' });
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-forest px-6 py-8 text-white sm:px-10 sm:py-11">
        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-sage"><Leaf size={14} /> Biodiversitas · Catatan waktu</p>
          <h1 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Tahun kelahiranmu menyimpan sebuah kisah.</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">Cari spesies yang tercatat punah pada tahun itu. Kenali namanya, dan simpan yang ingin kamu ingat.</p>
        </div>
        <div aria-hidden="true" className="absolute -bottom-16 -right-14 size-64 rounded-full border-[34px] border-white/[0.06] sm:size-80" />
        <div aria-hidden="true" className="absolute right-16 top-9 size-16 rounded-full bg-sage/10" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mist text-forest"><Search size={18} /></span>
            <div>
              <h2 className="font-bold">Mulai dari umurmu</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">Kami hitung perkiraan tahun lahir dari tahun ini dikurangi umur.</p>
            </div>
          </div>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Input
              id="age"
              label="Umur"
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              value={age}
              onChange={(event) => { setAge(event.target.value); setValidationError(''); }}
              placeholder="Contoh: 20"
              hint={`Katalog mencakup tahun ${DATASET_MIN_YEAR}–${DATASET_MAX_YEAR}.`}
              required
            />
            {validationError && <p className="text-sm text-red-700" role="alert">{validationError}</p>}
            <Button type="submit" className="w-full"><ArrowDown size={16} /> Temukan kisah</Button>
          </form>
          <p className="mt-4 text-xs leading-relaxed text-muted">Hasil mengikuti ketepatan sumber data. Tahun penilaian tidak dianggap sebagai tahun kepunahan.</p>
        </div>

        <div className="space-y-4">
          {fromCache && <p className="rounded-xl bg-sage/50 px-4 py-2.5 text-xs text-forest">Katalog ditampilkan dari cache perangkat.</p>}
          {error && <ErrorState message={error} onRetry={reload} />}
          {searched && !result.valid && !validationError && <ErrorState message={result.error} />}
          {searched && result.valid && (
            <>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest">Tahun kelahiran</p>
                  <h2 className="mt-1 text-2xl font-bold">{result.birthYear}</h2>
                </div>
                <p className="pb-1 text-xs text-muted">{matches.length} spesies ditemukan</p>
              </div>
              {loading ? <LoadingState label="Mencari dalam katalog…" /> : (
                <AnimalList animals={matches} favoriteIds={favoriteIds} onAddFavorite={add} />
              )}
            </>
          )}
          {!searched && !error && (
            <div className="flex min-h-52 flex-col justify-center rounded-3xl border border-dashed border-line px-6 py-8">
              <p className="text-sm font-semibold text-forest">Mulai pencarianmu</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">Masukkan umur untuk melihat hingga tiga spesies yang memiliki catatan tahun kepunahan yang sesuai.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
