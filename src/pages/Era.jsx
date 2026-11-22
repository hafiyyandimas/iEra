import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '../app/AppDataContext.jsx';
import AnimalCard from '../components/animals/AnimalCard.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import SkeletonCards from '../components/feedback/SkeletonCards.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import RingArt from '../components/ui/RingArt.jsx';
import { useCountUp } from '../hooks/useCountUp.js';

const FIRST_YEAR = 2001;
const LAST_YEAR = 2026;
const years = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => FIRST_YEAR + index);

function VerticalYearSlider({ value, onChange }) {
  const progress = (value - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR);
  return (
    <aside className="sticky top-24 flex h-[min(68vh,34rem)] flex-col items-center justify-between self-start" aria-label="Pilih tahun timeline">
      <span className="text-[10px] text-muted">2001</span>
      <div className="relative flex h-full min-h-0 w-8 justify-center py-2">
        <label className="sr-only" htmlFor="era-year-slider">Tahun fokus timeline</label>
        <input
          id="era-year-slider"
          type="range"
          min={FIRST_YEAR}
          max={LAST_YEAR}
          step="1"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-full min-h-0 w-8 cursor-pointer accent-forest [writing-mode:vertical-lr]"
        />
        <span
          aria-hidden="true"
          style={{ top: `calc(0.8rem + (100% - 1.6rem) * ${progress})` }}
          className="pointer-events-none absolute right-full mr-1 -translate-y-1/2 rounded-full bg-forest px-2 py-0.5 text-[11px] font-bold tabular-nums text-white shadow-sm transition-[top] duration-150 ease-out"
        >
          {value}
        </span>
      </div>
      <span className="text-[10px] text-muted">2026</span>
    </aside>
  );
}

function EraStats({ total, yearsWithRecords, loading }) {
  const count = useCountUp(total, { from: 0 });
  const covered = useCountUp(yearsWithRecords, { from: 0 });
  if (loading && total === 0) return null;
  return (
    <dl className="mt-5 flex flex-wrap gap-2.5 text-xs">
      <div className="rounded-3xl border border-line bg-white px-4.5 py-2">
        <dt className="text-muted">Spesies tercatat</dt>
        <dd className="mt-0.5 text-lg font-bold tabular-nums text-forest">{count}</dd>
      </div>
    </dl>
  );
}

export default function EraPage() {
  const { animals, loading, error, fromCache, reload, toggleFavorite, favorites, notify } = useAppData();
  const sectionRefs = useRef(new Map());
  const frameRef = useRef(0);
  const [activeYear, setActiveYear] = useState(FIRST_YEAR);
  const grouped = useMemo(() => {
    const map = new Map(years.map((year) => [year, []]));
    for (const animal of animals) {
      if (map.has(Number(animal.extinction_year))) map.get(Number(animal.extinction_year)).push(animal);
    }
    return map;
  }, [animals]);
  const yearsWithRecords = useMemo(() => [...grouped.entries()].filter(([year, list]) => year <= 2025 && list.length > 0).length, [grouped]);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.animalId)), [favorites]);

  useEffect(() => {
    const updateFocus = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const center = window.innerHeight * 0.44;
        let closestYear = FIRST_YEAR;
        let closestDistance = Infinity;
        for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 1) {
          const element = sectionRefs.current.get(year);
          if (!element) continue;
          const rect = element.getBoundingClientRect();
          const distance = Math.abs((rect.top + Math.min(rect.height, 140) / 2) - center);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestYear = year;
          }
        }
        setActiveYear((current) => current === closestYear ? current : closestYear);
      });
    };
    window.addEventListener('scroll', updateFocus, { passive: true });
    window.addEventListener('resize', updateFocus);
    updateFocus();
    return () => {
      window.removeEventListener('scroll', updateFocus);
      window.removeEventListener('resize', updateFocus);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const goToYear = (year) => {
    setActiveYear(year);
    const target = sectionRefs.current.get(year);
    target?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  };

  const handleFavorite = (animal) => {
    const saved = toggleFavorite(animal);
    notify({ type: saved ? 'success' : 'error', message: saved ? 'Koleksi favorit diperbarui.' : 'Favorit tidak dapat disimpan.' });
  };

  return (
    <section>
      <header className="relative mb-6 overflow-hidden rounded-3xl bg-forest p-6 text-white sm:p-9">
        <RingArt className="float-soft pointer-events-none absolute -right-10 -top-10 size-56 text-sage/25 sm:-right-4 sm:size-72" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage">Timeline vertikal</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Era</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">Jelajahi catatan spesies dari 2001 hingga 2025. Tahun 2026 menandai batas timeline, bukan tahun katalog.</p>
          <EraStats total={animals.length} yearsWithRecords={yearsWithRecords} loading={loading} />
        </div>
      </header>
      {fromCache && <p className="mb-4 rounded-xl bg-sage/45 px-3 py-2 text-xs text-forest">Menampilkan katalog yang tersimpan di perangkat.</p>}
      {error && <div className="mb-5"><ErrorState message={error} onRetry={reload} /></div>}
      <div className="grid grid-cols-[minmax(0,1fr)_46px] gap-3 sm:grid-cols-[minmax(0,1fr)_64px] sm:gap-6">
        <div className="min-w-0">
          {loading && animals.length === 0 && <SkeletonCards count={3} label="Memuat katalog spesies…" />}
          {!loading && animals.length === 0 && !error && <p className="mb-4 text-sm text-muted">Katalog belum berisi data terverifikasi.</p>}
          {years.map((year) => {
            const boundary = year === FIRST_YEAR || year === LAST_YEAR;
            const yearAnimals = grouped.get(year) || [];
            const isActive = !boundary && activeYear === year;
            const passed = year < activeYear;
            return (
              <section
                key={year}
                id={`era-year-${year}`}
                ref={(element) => {
                  if (element) sectionRefs.current.set(year, element);
                  else sectionRefs.current.delete(year);
                }}
                className={`min-h-32 scroll-mt-24 border-l-2 pb-6 pl-4 transition-colors duration-500 sm:pl-6 ${passed ? 'border-forest/60' : 'border-line'}`}
              >
                <button
                  type="button"
                  onClick={() => goToYear(year)}
                  aria-label={`Fokus tahun ${year}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`-ml-[1.55rem] mb-3 inline-flex items-center gap-2 rounded-full bg-paper px-2 py-1 text-left transition-[color,transform] duration-300 hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest sm:-ml-[2.05rem] ${boundary ? 'text-xs text-muted' : isActive ? 'origin-left scale-110 text-xl font-bold text-forest' : 'text-base font-semibold text-ink'}`}
                >
                  <span className={`size-2.5 rounded-full border-2 transition-colors duration-300 ${isActive ? 'node-pulse border-forest bg-sage' : yearAnimals.length ? 'border-forest bg-forest' : 'border-line bg-paper'}`} aria-hidden="true" />
                  <span className="tabular-nums">{year}</span>
                </button>
                {yearAnimals.length
                  ? <div className="space-y-3">{yearAnimals.map((animal) => (
                    <Reveal key={animal.id}>
                      <AnimalCard
                        animal={animal}
                        compact
                        isFavorite={favoriteIds.has(animal.id)}
                        onToggleFavorite={handleFavorite}
                      />
                    </Reveal>
                  ))}</div>
                  : <p className="pb-2 text-xs text-muted">{year === LAST_YEAR ? 'Batas visual timeline.' : 'Belum ada spesies tercatat untuk tahun ini.'}</p>}
              </section>
            );
          })}
        </div>
        <VerticalYearSlider value={activeYear} onChange={goToYear} />
      </div>
    </section>
  );
}
