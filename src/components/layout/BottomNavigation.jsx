import { Heart, House, UserRound } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Beranda', icon: House },
  { id: 'favorites', label: 'Favorit', icon: Heart },
  { id: 'about', label: 'About Me', icon: UserRound }
];

export default function BottomNavigation({ activeTab, onChange }) {
  return (
    <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-3">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange(id)}
              className={`flex min-h-[68px] flex-col items-center justify-center gap-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-forest ${active ? 'text-forest' : 'text-muted hover:text-forest'}`}
            >
              <span className={`grid size-8 place-items-center rounded-xl ${active ? 'bg-mist' : ''}`}><Icon size={20} strokeWidth={active ? 2.4 : 1.8} /></span>
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
