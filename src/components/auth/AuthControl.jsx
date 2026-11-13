import { useState } from 'react';
import { LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import AuthDialog from './AuthDialog.jsx';

export default function AuthControl() {
  const { user, profile, loading, error, signOut } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const handleSignOut = async () => {
    setSignOutError('');
    try {
      await signOut();
      setMenuOpen(false);
    } catch (signOutFailure) {
      setSignOutError(signOutFailure.message || 'Tidak dapat keluar dari akun.');
    }
  };

  return (
    <div className="relative">
      {user ? (
        <Button
          variant="outline"
          className="!min-h-9 gap-1.5 px-2.5 py-1 text-xs"
          aria-label={profile?.role === 'admin' ? 'Menu admin' : 'Menu akun'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {profile?.role === 'admin' ? <ShieldCheck size={15} /> : <UserRound size={15} />}
          <span className="hidden sm:inline">{profile?.role === 'admin' ? 'Admin' : profile?.role === 'user' ? 'User' : 'Akun'}</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          className="!min-h-9 gap-1.5 px-2.5 py-1 text-xs"
          aria-label="Masuk atau daftar"
          onClick={() => setDialogOpen(true)}
        >
          <LogIn size={15} />
          <span className="hidden sm:inline">Masuk</span>
        </Button>
      )}

      {user && menuOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-line bg-white p-3 shadow-lg">
          <p className="truncate text-sm font-semibold">{user.email}</p>
          <p className="mt-1 text-xs text-muted">Role: {profile?.role || (loading ? 'memuat…' : 'belum tersedia')}</p>
          {(error || signOutError) && <p role="alert" className="mt-2 text-xs text-red-700">{signOutError || error}</p>}
          <Button variant="ghost" className="mt-3 min-h-9 w-full justify-start px-2 text-xs" onClick={handleSignOut}>
            <LogOut size={15} /> Keluar
          </Button>
        </div>
      )}

      <AuthDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
