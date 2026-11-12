export default function Input({ label, id, hint, ...props }) {
  return (
    <div className="space-y-2">
      {label && <label htmlFor={id} className="block text-sm font-semibold text-ink">{label}</label>}
      <input
        id={id}
        className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-sage"
        {...props}
      />
      {hint && <p className="text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}
