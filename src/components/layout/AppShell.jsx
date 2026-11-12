import { Leaf, WifiOff } from 'lucide-react';
import BottomNavigation from './BottomNavigation.jsx';
import Button from '../ui/Button.jsx';

export default function AppShell({ activeTab, onTabChange, isOnline, install, canInstall, children }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-forest text-sage"><Leaf size={19} /></span>
            <div>
              <p className="font-bold leading-tight tracking-tight">iEra</p>
              <p className="text-[11px] leading-tight text-muted">Jejak yang hilang</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-900"><WifiOff size={14} /> Offline</span>}
            {canInstall && <Button variant="outline" className="min-h-9 px-3 text-xs" onClick={install}>Pasang aplikasi</Button>}
          </div>
        </div>
      </header>
      {!isOnline && <div className="bg-amber-50 px-5 py-2 text-center text-xs text-amber-950">Mode offline aktif. Perubahan tersimpan di perangkat dan menunggu sinkronisasi.</div>}
      <main className="mx-auto min-h-[calc(100vh-136px)] max-w-5xl px-5 pb-28 pt-7 sm:px-8 sm:pt-10">
        {children}
      </main>
      <BottomNavigation activeTab={activeTab} onChange={onTabChange} />
    </div>
  );
}
