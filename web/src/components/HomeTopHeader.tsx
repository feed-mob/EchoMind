import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

type HomeTopHeaderProps = {
  activeMenu: 'group' | 'mood';
};

export default function HomeTopHeader({ activeMenu }: HomeTopHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const getFallbackAvatar = (name?: string | null) => {
    const initial = (name || user?.email || 'A')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
      .charAt(0) || 'A';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" fill="#dbeafe"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#137fec">${initial}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  return (
    <header className="relative z-30 h-16 flex items-center justify-between px-8 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-bold tracking-tight">EchoMind</h1>
        <div className="relative w-full max-w-md ml-8">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all"
            placeholder="Search groups..."
            type="text"
          />
        </div>
      </div>

      {user ? (
        <div className="ml-4 shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/group')}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              activeMenu === 'group'
                ? 'border-primary bg-primary text-white hover:bg-primary/90'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Group
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-mood')}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              activeMenu === 'mood'
                ? 'border-primary bg-primary text-white hover:bg-primary/90'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Mood
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setUserMenuOpen((open) => !open);
              }}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
              aria-label="User menu"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <img
                src={user.avatar || getFallbackAvatar(user.name)}
                alt={user.name || user.email || 'User avatar'}
                className="h-full w-full object-cover"
              />
            </button>

            {userMenuOpen ? (
              <div
                className="absolute right-0 top-12 z-[60] w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                role="menu"
                aria-label="User menu"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user.name || 'Signed in user'}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  role="menuitem"
                >
                  <span className="material-icons text-base" aria-hidden="true">logout</span>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
