import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '../ui/Button.jsx';

export default function UpdatePrompt() {
  const [updateAction, setUpdateAction] = useState(null);
  useEffect(() => {
    const onUpdate = (event) => setUpdateAction(() => event.detail.update);
    window.addEventListener('iera-update-ready', onUpdate);
    return () => window.removeEventListener('iera-update-ready', onUpdate);
  }, []);
  if (!updateAction) return null;
  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3 shadow-lg">
      <p className="text-sm text-ink">Versi baru iEra siap digunakan.</p>
      <Button className="min-h-9 px-3 text-xs" onClick={updateAction}><RefreshCw size={14} /> Perbarui</Button>
    </div>
  );
}
