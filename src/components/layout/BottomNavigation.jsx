import { NavLink } from 'react-router-dom';
import { Heart, History, Search, UserRound, Database } from 'lucide-react';

const tabs = [
  { to: '/era', label: 'Era', icon: History },
  { to: '/database', label: 'Extinct DB', icon: Database },
  { to: '/guessr', label: 'EraGuessr', icon: Search },
  { to: '/favorit', label: 'Favorit', icon: Heart },
  { to: '/about', label: 'About Me', icon: UserRound }
];

export default function BottomNavigation() {
  return (
    <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {tabs.map(({ to, label, icon: Icon }, index) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) => `flex min-h-[68px] flex-col items-center justify-center gap-1 text-[10px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-forest sm:text-xs ${isActive ? 'text-forest' : 'text-muted hover:text-forest'}`}
          >
            {({ isActive }) => (
              <>
                <span className={`grid size-8 place-items-center rounded-xl ${index === 2 ? 'size-9 bg-forest text-white' : isActive ? 'bg-mist' : ''}`}>
                  <Icon size={index === 2 ? 18 : 19} strokeWidth={isActive ? 2.3 : 1.8} />
                </span>
                <span className="max-w-full truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
