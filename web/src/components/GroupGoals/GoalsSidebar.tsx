import type { GoalViewMode, GoalViewModel } from './types';

interface GoalsSidebarProps {
  visibleGoals: GoalViewModel[];
  selectedGoalId: string;
  viewMode: GoalViewMode;
  searchText: string;
  className?: string;
  onSelectGoal: (goalId: string) => void;
  onSearchChange: (value: string) => void;
  onChangeViewMode: (mode: GoalViewMode) => void;
  onCreateGoal: () => void;
}

export default function GoalsSidebar({
  visibleGoals,
  selectedGoalId,
  viewMode,
  searchText,
  className,
  onSelectGoal,
  onSearchChange,
  onChangeViewMode,
  onCreateGoal,
}: GoalsSidebarProps) {
  const getFallbackAvatar = (name?: string | null) => {
    const initial = (name || 'A')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
      .charAt(0) || 'A';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" fill="#dbeafe"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#137fec">${initial}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  return (
    <aside
      className={`border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden bg-white dark:bg-background-dark/50 lg:w-[280px] xl:w-[320px] lg:flex-none ${className || ''}`}
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all"
              placeholder="Search goals..."
              type="text"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <button
            onClick={onCreateGoal}
            className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition-all shrink-0"
          >
            <span className="material-icons text-sm">add</span> New Goal
          </button>
        </div>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${
              viewMode === 'active'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                : 'text-slate-500 dark:text-slate-400'
            }`}
            onClick={() => onChangeViewMode('active')}
          >
            Active
          </button>
          <button
            className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${
              viewMode === 'archived'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                : 'text-slate-500 dark:text-slate-400'
            }`}
            onClick={() => onChangeViewMode('archived')}
          >
            Archived
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {visibleGoals.length === 0 ? (
          <div className="p-3 text-xs text-slate-400">No goals found.</div>
        ) : (
          <div className="space-y-2.5">
            {visibleGoals.map((goal) => {
              const active = selectedGoalId === goal.id;
              const hasCreator = Boolean(goal.creatorName);

              return (
              <button
                key={goal.id}
                className={`w-full text-left p-3 bg-slate-50 dark:bg-slate-900 rounded-lg shadow-sm cursor-pointer group transition-all ${
                  active
                    ? 'border-2 border-primary'
                    : 'border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                }`}
                onClick={() => onSelectGoal(goal.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${active ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}>
                      {goal.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {goal.description || 'No description yet.'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      {hasCreator && (
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-xs">person</span>
                          {goal.creatorName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-xs">schedule</span>
                        {new Date(goal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
