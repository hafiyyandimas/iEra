import { useEffect, useState } from 'react';
import { Heart, Save, Trash2 } from 'lucide-react';
import { formatExtinction } from '../../utils/dateFormat.js';
import Button from '../ui/Button.jsx';

export default function FavoriteCard({ favorite, onSaveNote, onRequestDelete }) {
  const [note, setNote] = useState(favorite.note || '');
  const [dirty, setDirty] = useState(false);
  const animal = favorite.animal;

  useEffect(() => {
    setNote(favorite.note || '');
    setDirty(false);
  }, [favorite.note]);

  return (
    <article className="grid overflow-hidden rounded-3xl border border-line bg-white sm:grid-cols-[170px_1fr]">
      <img
        src={animal.image_url}
        alt={animal.image_alt || `Ilustrasi ${animal.common_name}`}
        className="h-48 w-full bg-mist object-cover sm:h-full"
        loading="lazy"
        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/animal-placeholder.svg'; }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-forest">Tercatat {formatExtinction(animal)}</p>
            <h2 className="mt-1 text-lg font-bold">{animal.common_name}</h2>
            <p className="mt-0.5 text-sm italic text-muted">{animal.scientific_name}</p>
          </div>
          <Heart size={18} className="mt-1 shrink-0 text-forest" fill="currentColor" />
        </div>
        <label htmlFor={`note-${favorite.animalId}`} className="mt-4 block text-xs font-semibold text-ink">Catatan pribadi</label>
        <textarea
          id={`note-${favorite.animalId}`}
          value={note}
          maxLength={500}
          rows={2}
          onChange={(event) => { setNote(event.target.value); setDirty(true); }}
          placeholder="Tulis catatan untuk dirimu…"
          className="mt-2 w-full resize-y rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-forest focus:ring-2 focus:ring-sage"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted">{note.length}/500 karakter</span>
          <div className="flex gap-2">
            <Button variant="outline" className="min-h-9 px-3 text-xs" disabled={!dirty} onClick={() => onSaveNote(favorite.animalId, note)}><Save size={14} /> Simpan</Button>
            <Button variant="danger" className="min-h-9 px-3 text-xs" onClick={() => onRequestDelete(favorite)}><Trash2 size={14} /> Hapus</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
