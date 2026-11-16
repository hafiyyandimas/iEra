import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAppData } from '../app/AppDataContext.jsx';
import { fetchAnimal } from '../services/animalService.js';
import { getApiError } from '../services/apiClient.js';
import Button from '../components/ui/Button.jsx';
import FavoriteHeart from '../components/ui/FavoriteHeart.jsx';
import SmartImage from '../components/ui/SmartImage.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';

export default function AnimalDetailPage() {
  const { id } = useParams();
  const { animals, personalAnimals, favorites, toggleFavorite, isOnline, notify } = useAppData();
  const [remoteAnimal, setRemoteAnimal] = useState(null);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [error, setError] = useState('');
  const animal = useMemo(() => (
    [...personalAnimals, ...animals].find((item) => item.id === id || item.slug === id) || remoteAnimal
  ), [animals, personalAnimals, id, remoteAnimal]);
  const isFavorite = favorites.some((favorite) => favorite.animalId === animal?.id);

  useEffect(() => {
    setError('');
    setLoadingRemote(false);
    if (!id || personalAnimals.some((item) => item.id === id) || animals.some((item) => item.id === id || item.slug === id)) return;
    setRemoteAnimal(null);
    if (!isOnline) {
      setError('Detail belum tersimpan di perangkat. Sambungkan internet untuk memuat spesies ini.');
      return;
    }
    let active = true;
    setLoadingRemote(true);
    fetchAnimal(id)
      .then((result) => { if (active) setRemoteAnimal(result); })
      .catch((requestError) => { if (active) setError(getApiError(requestError)); })
      .finally(() => { if (active) setLoadingRemote(false); });
    return () => { active = false; };
  }, [id, animals, personalAnimals, isOnline]);

  const handleFavorite = () => {
    const saved = toggleFavorite(animal);
    notify({ type: saved ? 'success' : 'error', message: saved ? 'Koleksi favorit diperbarui di perangkat.' : 'Favorit tidak dapat disimpan.' });
  };

  if (loadingRemote && !animal) return <LoadingState label="Memuat detail spesies…" />;
  if (!animal) return (
    <section className="space-y-4">
      <Link to="/database" className="inline-flex items-center gap-2 text-sm font-medium text-forest"><ArrowLeft size={16} /> Kembali ke database</Link>
      {error && <ErrorState message={error} />}
      {!error && <p className="text-sm text-muted">Spesies tidak ditemukan.</p>}
    </section>
  );

  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <Link to="/database" className="group inline-flex items-center gap-2 text-sm font-medium text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest">
        <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" /> Kembali
      </Link>
      {animal.is_personal && <p className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">Data pribadi - belum diverifikasi</p>}
      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <SmartImage
          eager
          src={animal.image_url}
          alt={animal.image_alt || `Ilustrasi ${animal.common_name}`}
          className="aspect-[4/3] w-full sm:aspect-[16/9]"
        />
        <div className="space-y-5 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${animal.year_is_estimated ? 'bg-amber-50 text-amber-900' : 'bg-sage/60 text-forest'}`}>{animal.year_is_estimated ? 'Perkiraan tahun kepunahan' : 'Tahun kepunahan'} · <span className="tabular-nums">{animal.extinction_year}</span></p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{animal.common_name}</h1>
              <p className="mt-1 text-base italic text-muted">{animal.scientific_name}</p>
            </div>
            <Button variant={isFavorite ? 'secondary' : 'outline'} aria-pressed={isFavorite} onClick={handleFavorite}><FavoriteHeart active={isFavorite} size={16} /> {isFavorite ? 'Hapus favorit' : 'Tambah favorit'}</Button>
          </div>
          {animal.description && <p className="whitespace-pre-line text-sm leading-7 text-muted">{animal.description}</p>}
          {(animal.habitat || animal.region) && (
            <div className="flex flex-wrap gap-3 border-t border-line pt-4 text-sm text-muted">
              {animal.habitat && <span className="inline-flex items-center gap-1.5"><MapPin size={15} />{animal.habitat}</span>}
              {animal.region && <span>{animal.region}</span>}
            </div>
          )}
          {(animal.source_url || animal.image_credit || animal.image_license) && <div className="space-y-2 border-t border-line pt-4 text-xs leading-relaxed text-muted">
            {animal.source_url && <p>Sumber informasi: <a href={animal.source_url} target="_blank" rel="noreferrer" className="font-medium text-forest underline underline-offset-2">{animal.source_name || 'Lihat sumber'}</a></p>}
            {animal.image_credit && <p>Kredit gambar: {animal.image_credit}</p>}
            {animal.image_license && <p>Lisensi gambar: {animal.image_license}</p>}
          </div>}
        </div>
      </div>
    </article>
  );
}
