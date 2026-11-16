import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import FavoriteHeart from '../ui/FavoriteHeart.jsx';
import SmartImage from '../ui/SmartImage.jsx';

export default function AnimalCard({ animal, isFavorite, onToggleFavorite, compact = false, index }) {
  const estimated = Boolean(animal.year_is_estimated);
  const detailPath = `/animal/${encodeURIComponent(animal.id)}`;
  const staggered = index !== undefined;
  const layout = compact
    ? 'era-card-wiggle grid grid-cols-[88px_1fr] gap-3 p-3 sm:grid-cols-[112px_1fr]'
    : 'grid grid-cols-[92px_1fr] gap-4 p-3 sm:grid-cols-[132px_1fr] sm:p-4';

  return (
    <article
      style={staggered ? { '--i': index } : undefined}
      className={`group overflow-hidden rounded-2xl border border-line bg-white transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-sage-dark hover:shadow-[0_12px_26px_-18px_rgba(32,75,55,0.5)] ${staggered ? 'enter-up' : ''} ${layout}`}
    >
      <Link to={detailPath} className="block self-start rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest">
        <SmartImage
          src={animal.image_url}
          alt={animal.image_alt || `Ilustrasi ${animal.common_name}`}
          className="aspect-square rounded-xl"
          imgClassName="group-hover:scale-105"
        />
      </Link>
      <div className="min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              title={estimated ? 'Tahun kepunahan ini adalah perkiraan.' : undefined}
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${estimated ? 'bg-amber-50 text-amber-900' : 'bg-sage/60 text-forest'}`}
            >
              {estimated ? `Perkiraan ${animal.extinction_year}` : animal.extinction_year}
            </p>
            <Link to={detailPath} className="mt-1.5 block rounded-sm text-sm font-bold leading-snug text-ink transition-colors hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest sm:text-base">
              {animal.common_name}
            </Link>
            <p className="mt-0.5 truncate text-xs italic text-muted">{animal.scientific_name}</p>
          </div>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              className={`min-h-9 shrink-0 px-2 ${isFavorite ? 'text-rose-600 hover:text-rose-700' : ''}`}
              aria-label={isFavorite ? `Hapus ${animal.common_name} dari favorit` : `Tambah ${animal.common_name} ke favorit`}
              aria-pressed={Boolean(isFavorite)}
              onClick={() => onToggleFavorite(animal)}
            >
              <FavoriteHeart active={Boolean(isFavorite)} />
            </Button>
          )}
        </div>
        {animal.is_personal && <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900">Data pribadi - belum diverifikasi</p>}
        {!compact && animal.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{animal.description}</p>}
      </div>
    </article>
  );
}
