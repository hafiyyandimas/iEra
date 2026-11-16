export default function SkeletonCards({ count = 3, label = 'Memuat data…' }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true" className="grid grid-cols-[92px_1fr] gap-4 rounded-2xl border border-line bg-white p-3 sm:grid-cols-[132px_1fr] sm:p-4">
          <div className="skeleton aspect-square rounded-xl sm:aspect-auto sm:min-h-24" />
          <div className="space-y-2.5 py-1">
            <div className="skeleton h-3 w-16 rounded-full" />
            <div className="skeleton h-4 w-3/4 rounded-full" />
            <div className="skeleton h-3 w-1/2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
