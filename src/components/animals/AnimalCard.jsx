import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';

function displayYear(animal) {
  return `${animal.year_is_estimated ? 'Perkiraan ' : ''}${animal.extinction_year}`;
}

export default function AnimalCard({ animal, isFavorite, onToggleFavorite, compact = false }) {
  return (
    <article className={`overflow-hidden rounded-2xl border border-line bg-white ${compact ? 'grid grid-cols-[88px_1fr] gap-3 p-3 sm:grid-cols-[112px_1fr]' : 'grid grid-cols-[92px_1fr] gap-4 p-3 sm:grid-cols-[132px_1fr] sm:p-4'}`}>
      <Link to={`/animal/${encodeURIComponent(animal.id)}`} className="block overflow-hidden rounded-xl bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest">
        <img
          src={animal.image_url || '/images/animal-placeholder.svg'}
          alt={animal.image_alt || `Ilustrasi ${animal.common_name}`}
          className={`w-full object-cover ${compact ? 'aspect-square' : 'h-full min-h-24'}`}
          loading="lazy"
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/animal-placeholder.svg'; }}
        />
      </Link>
      <div className="min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-forest">{displayYear(animal)}</p>
            <Link to={`/animal/${encodeURIComponent(animal.id)}`} className="mt-1 block rounded-sm text-sm font-bold leading-snug text-ink hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest sm:text-base">
              {animal.common_name}
            </Link>
            <p className="mt-0.5 truncate text-xs italic text-muted">{animal.scientific_name}</p>
          </div>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              className="min-h-9 shrink-0 px-2"
              aria-label={isFavorite ? `Hapus ${animal.common_name} dari favorit` : `Tambah ${animal.common_name} ke favorit`}
              onClick={() => onToggleFavorite(animal)}
            >
              <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
          )}
        </div>
        {animal.is_personal && <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900">Data pribadi — belum diverifikasi</p>}
        {!compact && animal.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{animal.description}</p>}
      </div>
    </article>
  );
}
