import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '../ui/Button.jsx';

const emptyForm = {
  common_name: '',
  scientific_name: '',
  extinction_year: '',
  year_is_estimated: false,
  description: '',
  image_url: '',
  image_alt: '',
  habitat: '',
  region: '',
  source_url: '',
  image_credit: '',
  image_license: ''
};

const fields = [
  ['common_name', 'Nama umum', true],
  ['scientific_name', 'Nama ilmiah', true],
  ['extinction_year', 'Tahun kepunahan', true],
  ['habitat', 'Habitat', false],
  ['region', 'Wilayah', false],
  ['image_url', 'URL gambar', false],
  ['image_alt', 'Teks alternatif gambar', false],
  ['source_url', 'URL sumber informasi', true],
  ['image_credit', 'Kredit gambar', false],
  ['image_license', 'Lisensi gambar', false]
];

function slugify(value) {
  return value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AnimalForm({ animal = null, onClose, onSubmit }) {
  const editing = Boolean(animal);
  const [values, setValues] = useState(() => {
    if (!animal) return emptyForm;
    return Object.fromEntries(Object.keys(emptyForm).map((name) => {
      if (name === 'extinction_year') return [name, String(animal.extinction_year ?? '')];
      if (name === 'year_is_estimated') return [name, Boolean(animal.year_is_estimated)];
      return [name, animal[name] ?? ''];
    }));
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const year = Number(values.extinction_year);
    if (!Number.isInteger(year) || year < 2001 || year > 2025) {
      setError('Tahun harus berupa angka bulat antara 2001 dan 2025.');
      return;
    }
    for (const field of ['image_url', 'source_url']) {
      if (!values[field]) continue;
      try {
        const url = new URL(values[field]);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch {
        setError(`URL ${field === 'image_url' ? 'gambar' : 'sumber'} harus valid dan menggunakan HTTP atau HTTPS.`);
        return;
      }
    }
    setError('');
    const speciesSlug = slugify(values.scientific_name || values.common_name)
      .slice(0, 180)
      .replace(/-+$/g, '');
    setSaving(true);
    try {
      const payload = {
        ...values,
        slug: animal?.slug || `${speciesSlug || `species-${Date.now()}`}-${year}`,
        extinction_year: year,
        year_is_estimated: Boolean(values.year_is_estimated),
        description: values.description.trim()
      };
      for (const [name, , required] of fields) {
        if (!required && payload[name] === '') payload[name] = null;
      }
      await onSubmit(payload);
      setError('');
    } catch (submitError) {
      setError(submitError.message || 'Data gagal disimpan. Periksa koneksi, lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="backdrop-enter fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/45 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="animal-form-title" className="dialog-enter max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-paper">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 id="animal-form-title" className="font-bold">{editing ? 'Edit data spesies' : 'Tambah ke katalog resmi'}</h2>
            <p className="mt-1 text-xs text-muted">{editing ? 'Perubahan langsung tersimpan di katalog resmi iEra.' : 'Data ini akan tersimpan di katalog iEra.'}</p>
          </div>
          <button type="button" aria-label="Tutup form" onClick={onClose} disabled={saving} className="grid size-10 place-items-center rounded-xl text-muted hover:bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest disabled:opacity-50"><X size={19} /></button>
        </header>
        <form className="space-y-4 p-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([name, label, required]) => (
              <div key={name} className={name === 'image_url' || name === 'image_alt' || name === 'source_url' ? 'sm:col-span-2' : ''}>
                <label htmlFor={`animal-${name}`} className="mb-1.5 block text-sm font-medium">{label}{required ? ' *' : ''}</label>
                <input
                  id={`animal-${name}`}
                  required={required}
                  type={name === 'extinction_year' ? 'number' : name.endsWith('_url') ? 'url' : 'text'}
                  maxLength={200}
                  min={name === 'extinction_year' ? 2001 : undefined}
                  max={name === 'extinction_year' ? 2025 : undefined}
                  step={name === 'extinction_year' ? 1 : undefined}
                  value={values[name] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
                  className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-sage"
                />
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="animal-description" className="mb-1.5 block text-sm font-medium">Deskripsi *</label>
            <textarea id="animal-description" rows={3} maxLength={5000} required value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-sage" />
          </div>
          <label className="flex items-start gap-3 rounded-xl bg-mist p-3 text-sm">
            <input type="checkbox" checked={Boolean(values.year_is_estimated)} onChange={(event) => setValues((current) => ({ ...current, year_is_estimated: event.target.checked }))} className="mt-0.5 accent-forest" />
            <span>Tahun kepunahan adalah perkiraan</span>
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Simpan ke katalog'}</Button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}
