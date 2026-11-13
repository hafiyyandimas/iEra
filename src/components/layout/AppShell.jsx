import { Leaf, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import BottomNavigation from './BottomNavigation.jsx';
import Button from '../ui/Button.jsx';
import AuthControl from '../auth/AuthControl.jsx';

export default function AppShell({ isOnline, install, canInstall, children }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-4 sm:px-8">
          <Link to="/era" className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest" aria-label="iEra, ke halaman Era">
            <span className="grid size-9 place-items-center rounded-xl bg-forest text-sage"><Leaf size={19} /></span>
            <span>
              <span className="block font-bold leading-tight tracking-tight">iEra</span>
              <span className="block text-[11px] leading-tight text-muted">Extinct Species Explorer</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {!isOnline && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-900"><WifiOff size={14} /> Offline</span>}
            {canInstall && <Button variant="outline" className="min-h-9 px-3 text-xs" onClick={install}>Pasang</Button>}
            <AuthControl />
          </div>
        </div>
      </header>
      {!isOnline && <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-950">Data katalog yang pernah dimuat dan koleksi lokal tetap tersedia di perangkat.</div>}
      <main className="mx-auto min-h-[calc(100vh-136px)] max-w-5xl px-4 pb-28 pt-6 sm:px-8 sm:pt-9">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
