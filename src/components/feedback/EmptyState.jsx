import { Archive } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-mist text-forest"><Archive size={22} /></div>
      <h2 className="mt-4 text-base font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
