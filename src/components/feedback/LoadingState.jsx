export default function LoadingState({ label = 'Memuat data…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-muted" role="status">
      <span className="size-5 animate-spin rounded-full border-2 border-sage border-t-forest motion-reduce:animate-none" />
      {label}
    </div>
  );
}
