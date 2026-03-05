import { useNavigate } from 'react-router-dom';

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
  const tabPaddingFallback = { paddingLeft: '16px', paddingRight: '16px' };

  const navButtonClass = (tab: 'ideas' | 'goals' | 'ai') =>
    `shrink-0 px-3 sm:px-4 h-full text-sm font-medium transition-all ${
      activeTab === tab
        ? 'text-primary bg-primary/10 hover:bg-primary/20'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <>
      <header
        className={`h-16 px-3 sm:px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-4 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md ${
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
            <h1 className="hidden sm:block text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">WIDEA</h1>
          </button>
          <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
          <span className="hidden md:block text-lg font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{group.name}</span>
          <nav className="flex min-w-0 flex-1 items-center gap-1 h-10 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => navigate(`/group/${group.id}`)}
              className={navButtonClass('ideas')}
              style={tabPaddingFallback}
            >
              Ideas
            </button>
            <button
              onClick={() => navigate(`/group/${group.id}/goals`)}
              className={navButtonClass('goals')}
              style={tabPaddingFallback}
            >
              Goals
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
      </header>
    </>
  );
}
