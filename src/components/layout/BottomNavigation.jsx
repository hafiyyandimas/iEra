import { NavLink } from 'react-router-dom';
import { Dices, Heart, History, PawPrint, UserRound } from 'lucide-react';

const tabs = [
  { to: '/era', label: 'Era', icon: History },
  { to: '/database', label: 'Extinct DB', icon: PawPrint },
  { to: '/guessr', label: 'Tebak Era', icon: Dices },
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
            className={({ isActive }) => `group relative flex min-h-[68px] flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-forest active:bg-mist/60 sm:text-xs ${isActive ? 'text-forest' : 'text-muted hover:text-forest'}`}
          >
            {({ isActive }) => (
              <>
                {isActive && <span aria-hidden="true" className="tab-bar absolute left-1/2 top-0 h-[3px] w-9 -translate-x-1/2 rounded-b-full bg-forest" />}
                <span className={`grid size-8 place-items-center rounded-xl transition-[transform,box-shadow,color,background-color] duration-300 ${isActive ? 'tab-pop' : ''} ${index === 2 ? 'size-9 bg-forest text-white group-hover:scale-125 group-hover:rotate-6 group-hover:shadow-lg group-focus-visible:scale-125' : isActive ? 'bg-mist' : ''}`}>
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
