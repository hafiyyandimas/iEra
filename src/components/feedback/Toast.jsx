import { Check, CircleAlert, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const success = toast.type === 'success';
  return (
    <div role={success ? 'status' : 'alert'} className={`fixed left-4 right-4 top-4 z-[60] mx-auto flex max-w-lg items-start gap-3 rounded-2xl border p-4 shadow-lg ${success ? 'border-sage bg-white' : 'border-amber-200 bg-amber-50'}`}>
      {success ? <Check className="mt-0.5 shrink-0 text-forest" size={19} /> : <CircleAlert className="mt-0.5 shrink-0 text-amber-800" size={19} />}
      <p className="flex-1 text-sm leading-relaxed text-ink">{toast.message}</p>
      <button aria-label="Tutup notifikasi" className="rounded-lg p-1 text-muted hover:bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest" onClick={onDismiss}><X size={17} /></button>
    </div>
  );
}
