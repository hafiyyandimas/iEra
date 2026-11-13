import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-forest">404</p>
      <h1 className="mt-2 text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-muted">Halaman yang kamu cari tidak tersedia.</p>
      <Button asChild className="mt-5"><Link to="/era">Kembali ke Era</Link></Button>
    </section>
  );
}
