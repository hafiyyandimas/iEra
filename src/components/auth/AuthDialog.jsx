import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';

export default function AuthDialog({ open, onClose }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') {
        await signUp(username, password);
      } else {
        await signIn(username, password);
      }
      closeDialog();
    } catch (submitError) {
      setError(submitError.message || 'Autentikasi gagal. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const closeDialog = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return createPortal(
    <div
      className="backdrop-enter fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title" className="dialog-enter max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-paper p-5 shadow-xl sm:p-6">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-forest">Akun iEra</p>
            <h2 id="auth-dialog-title" className="mt-1 text-xl font-bold">{mode === 'login' ? 'Masuk' : 'Daftar'}</h2>
          </div>
          <button type="button" aria-label="Tutup" onClick={closeDialog} className="grid size-9 place-items-center rounded-xl text-muted hover:bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest">
            <X size={18} />
          </button>
        </header>

        <p className="mb-4 text-sm text-muted">
          {mode === 'login'
            ? 'Masuk dengan username dan password.'
            : 'Akun baru otomatis mendapat role user. Username harus unik.'}
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="auth-username" className="mb-1.5 block text-sm font-medium">Username</label>
            <input
              id="auth-username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9_]{3,24}"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-sage"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-sage"
            />
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Buat akun'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="font-semibold text-forest underline underline-offset-2"
          >
            {mode === 'login' ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </section>
    </div>,
    document.body
  );
}
