import { BookOpen, GraduationCap, IdCard, Leaf } from 'lucide-react';
import { profile } from '../data/profile.js';
import RingArt from '../components/ui/RingArt.jsx';

const details = [
  { label: 'Nama', value: profile.name, icon: IdCard },
  { label: 'NIM', value: profile.nim, icon: IdCard },
  { label: 'Kelompok', value: profile.group, icon: GraduationCap },
  { label: 'Shift', value: profile.shift, icon: BookOpen }
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-forest p-7 text-white sm:p-10">
        <RingArt className="float-soft pointer-events-none absolute -right-12 -top-12 size-64 text-sage/25" />
        <span className="relative grid size-12 place-items-center rounded-2xl bg-white/10 text-sage"><Leaf size={23} /></span>
        <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-sage">Profil praktikan</p>
        <h1 className="relative mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">About Me</h1>
        <p className="relative mt-3 max-w-lg text-sm leading-relaxed text-white/80">iEra membantu menjelajahi catatan kepunahan spesies dan menyimpan favorit secara lokal. Admin dapat menambahkan spesies ke katalog resmi.</p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        {details.map(({ label, value, icon: Icon }, index) => (
          <div key={label} style={{ '--i': index + 1 }} className={`enter-up group flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-mist/50 sm:px-6 ${index ? 'border-t border-line' : ''}`}>
            <span className="grid size-10 place-items-center rounded-xl bg-mist text-forest transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><Icon size={18} /></span>
            <div><p className="text-xs text-muted">{label}</p><p className="mt-0.5 font-semibold text-ink">{value}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
