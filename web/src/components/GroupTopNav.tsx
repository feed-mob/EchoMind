import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

type GroupTopNavProps = {
  group: {
    id: string;
    name: string;
  };
  activeTab: 'ideas' | 'goals' | 'ai' | 'settings';
  aiGoalId?: string;
  sticky?: boolean;
};

export default function GroupTopNav({ group, activeTab, aiGoalId, sticky = false }: GroupTopNavProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const tabPaddingFallback = { paddingLeft: '16px', paddingRight: '16px' };

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const navButtonClass = (tab: 'ideas' | 'goals' | 'ai') =>
    `shrink-0 px-3 sm:px-4 h-full text-sm font-medium transition-all ${
      activeTab === tab
        ? 'text-primary bg-primary/10 hover:bg-primary/20'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

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
    <>
      <header
        className={`relative z-30 h-16 px-3 sm:px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-4 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md ${
          sticky ? 'sticky top-0 z-50' : ''
        }`}
      >
        <div className="min-w-0 flex flex-1 items-center gap-2 sm:gap-6">
          <button
            onClick={() => navigate('/group')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
            aria-label="Back to groups"
          >
            <span className="material-icons">arrow_back</span>
            <h1 className="hidden sm:block text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">EchoMind</h1>
          </button>
          <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
          <span className="hidden md:block text-lg font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{group.name}</span>
          <nav className="flex min-w-0 flex-1 items-center gap-1 h-10 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => navigate(`/group/${group.id}/goals`)}
              className={navButtonClass('goals')}
              style={tabPaddingFallback}
            >
              Goals
            </button>
            <button
              onClick={() => navigate(`/group/${group.id}/ideas`)}
              className={navButtonClass('ideas')}
              style={tabPaddingFallback}
            >
              Ideas
            </button>
            <button
              onClick={() => navigate(`/group/${group.id}/ai-evaluate${aiGoalId ? `?goalId=${aiGoalId}` : ''}`)}
              className={`${navButtonClass('ai')} inline-flex items-center gap-1`}
              style={tabPaddingFallback}
            >
              <span className="material-icons text-base">auto_fix_high</span>
              AI Evaluate
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/group/${group.id}/settings`)}
            className={`icon-button inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-primary bg-primary/10 hover:bg-primary/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label="Group settings"
            title="Group settings"
          >
            <span className="material-icons">settings</span>
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <img
                  src={user.avatar || getFallbackAvatar(user.name)}
                  alt={user.name || user.email || 'User avatar'}
                  className="h-full w-full object-cover"
                />
              </button>

              {menuOpen ? (
                <div
                  className="absolute right-0 top-12 z-[60] w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  role="menu"
                  aria-label="User menu"
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
                      setMenuOpen(false);
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
          ) : null}
        </div>
      </header>
    </>
  );
}
