import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import BrandLogo from './BrandLogo';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <BrandLogo />

        <div className="hidden md:flex gap-10 text-sm font-semibold text-slate-500">
          <a className="hover:text-primary transition-colors" href="#features">Features</a>
          <a className="hover:text-primary transition-colors" href="#pricing">Pricing</a>
          <a className="hover:text-primary transition-colors" href="#solutions">Solutions</a>
        </div>

        <div>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm text-slate-600">{user?.name || user?.email}</span>
              <button
                onClick={() => navigate('/group')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                Enter App
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <GoogleLoginButton />
          )}
        </div>
      </div>
    </header>
  );
}
