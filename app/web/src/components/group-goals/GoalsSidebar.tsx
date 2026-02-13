import type { GoalViewMode, GoalViewModel } from './types';

interface GoalsSidebarProps {
  visibleGoals: GoalViewModel[];
  selectedGoalId: string;
  viewMode: GoalViewMode;
  searchText: string;
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
  onSelectGoal,
  onSearchChange,
  onChangeViewMode,
  onCreateGoal,
}: GoalsSidebarProps) {
  const getInitial = (name?: string | null) => {
    return (
      (name || 'A')
        .trim()
        .charAt(0)
        .toUpperCase() || 'A'
    );
  };

  return (
    <aside className="flex-1 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-background-dark/50">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
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

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {visibleGoals.length === 0 ? (
          <div className="p-3 text-xs text-slate-400">No goals found.</div>
        ) : (
          visibleGoals.map((goal) => {
            const active = selectedGoalId === goal.id;

            return (
              <button
                key={goal.id}
                className={`w-full text-left p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm cursor-pointer group transition-all border-2 ${
                  active
                    ? 'border-primary'
                    : 'border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                }`}
                onClick={() => onSelectGoal(goal.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {goal.creatorAvatar ? (
                      <img
                        src={goal.creatorAvatar}
                        alt={goal.creatorName || 'Creator'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitial(goal.creatorName)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className={`font-semibold leading-tight line-clamp-1 ${
                        active ? 'text-primary' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {goal.title}
                      </h3>
                      <span className="text-[10px] text-slate-500 shrink-0">{new Date(goal.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{goal.description || 'No description yet'}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-xs">person</span>
                        {goal.creatorName || 'Anonymous'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-xs">schedule</span>
                        {new Date(goal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
