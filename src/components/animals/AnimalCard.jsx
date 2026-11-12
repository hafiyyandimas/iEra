import { Heart, Leaf } from 'lucide-react';
import { formatExtinction } from '../../utils/dateFormat.js';
import Button from '../ui/Button.jsx';

export default function AnimalCard({ animal, isFavorite, onAddFavorite }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="relative aspect-[16/9] bg-mist">
        <img
          src={animal.image_url}
          alt={animal.image_alt || `Ilustrasi ${animal.common_name}`}
          className="size-full object-cover"
          loading="lazy"
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/animal-placeholder.svg'; }}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-forest">
          <Leaf size={13} /> Tercatat {formatExtinction(animal)}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold leading-snug text-ink">{animal.common_name}</h2>
            <p className="mt-1 text-sm italic text-muted">{animal.scientific_name}</p>
          </div>
          <Button
            variant={isFavorite ? 'secondary' : 'outline'}
            className="shrink-0 px-3"
            aria-label={isFavorite ? `Sudah menjadi favorit: ${animal.common_name}` : `Tambah ${animal.common_name} ke favorit`}
            disabled={isFavorite}
            onClick={() => onAddFavorite(animal)}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'Tersimpan' : 'Favorit'}
          </Button>
        </div>
        {animal.description && <p className="mt-4 text-sm leading-relaxed text-muted">{animal.description}</p>}
        <div className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">
          <p>Sumber data: <a className="font-medium text-forest underline underline-offset-2" href={animal.source_url} target="_blank" rel="noreferrer">{animal.source_name}</a></p>
          {animal.image_source_url && <p className="mt-1">Gambar: <a className="font-medium text-forest underline underline-offset-2" href={animal.image_source_url} target="_blank" rel="noreferrer">{animal.image_license || 'Sumber dan lisensi'}</a></p>}
        </div>
      </div>
    </article>
  );
}
