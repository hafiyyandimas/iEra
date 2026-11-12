import { CircleAlert, RefreshCw } from 'lucide-react';
import Button from '../ui/Button.jsx';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4" role="alert">
      <div className="flex gap-3">
        <CircleAlert className="mt-0.5 shrink-0 text-amber-800" size={19} />
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-amber-950">{message}</p>
          {onRetry && <Button variant="ghost" className="mt-2 min-h-9 px-2" onClick={onRetry}><RefreshCw size={15} /> Coba lagi</Button>}
        </div>
      </div>
    </div>
  );
}
