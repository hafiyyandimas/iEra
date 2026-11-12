import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button.jsx';

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 grid size-11 place-items-center rounded-full bg-red-50 text-red-700"><AlertTriangle size={20} /></div>
        <h2 id="confirm-title" className="text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Batal</Button>
          <Button variant="danger" onClick={onConfirm}>Hapus</Button>
        </div>
      </section>
    </div>
  );
}
