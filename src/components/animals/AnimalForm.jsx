import { useState } from 'react';
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
  ['source_url', 'URL sumber informasi', false],
  ['image_credit', 'Kredit gambar', false],
  ['image_license', 'Lisensi gambar', false]
];

export default function AnimalForm({ initialAnimal, onClose, onSubmit }) {
  const [values, setValues] = useState(() => ({
    ...emptyForm,
    ...initialAnimal,
    extinction_year: initialAnimal?.extinction_year ?? ''
  }));
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
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
    onSubmit({
      ...values,
      extinction_year: year,
      year_is_estimated: Boolean(values.year_is_estimated),
      description: values.description.trim(),
      slug: initialAnimal?.slug || `personal-${Date.now()}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="animal-form-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-paper sm:rounded-3xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 id="animal-form-title" className="font-bold">{initialAnimal ? 'Edit spesies pribadi' : 'Tambah spesies pribadi'}</h2>
            <p className="mt-1 text-xs text-muted">Data ini hanya disimpan di perangkat dan belum diverifikasi.</p>
          </div>
          <button type="button" aria-label="Tutup form" onClick={onClose} className="grid size-10 place-items-center rounded-xl text-muted hover:bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest"><X size={19} /></button>
        </header>
        <form className="space-y-4 p-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([name, label, required]) => (
              <div key={name} className={name === 'image_url' || name === 'image_alt' || name === 'source_url' ? 'sm:col-span-2' : ''}>
                <label htmlFor={`personal-${name}`} className="mb-1.5 block text-sm font-medium">{label}{required ? ' *' : ''}</label>
                <input
                  id={`personal-${name}`}
                  required={required}
                  type={name === 'extinction_year' ? 'number' : name.endsWith('_url') ? 'url' : 'text'}
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
            <label htmlFor="personal-description" className="mb-1.5 block text-sm font-medium">Deskripsi</label>
            <textarea id="personal-description" rows={3} maxLength={1000} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-sage" />
          </div>
          <label className="flex items-start gap-3 rounded-xl bg-mist p-3 text-sm">
            <input type="checkbox" checked={Boolean(values.year_is_estimated)} onChange={(event) => setValues((current) => ({ ...current, year_is_estimated: event.target.checked }))} className="mt-0.5 accent-forest" />
            <span>Tahun kepunahan adalah perkiraan</span>
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit">{initialAnimal ? 'Simpan perubahan' : 'Simpan di perangkat'}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
