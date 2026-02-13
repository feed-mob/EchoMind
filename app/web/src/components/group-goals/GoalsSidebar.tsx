import { getStatusMeta } from './utils';
import type { GoalViewMode, GoalViewModel } from './types';

interface GoalsSidebarProps {
  visibleGoals: GoalViewModel[];
  selectedGoalId: string;
  viewMode: GoalViewMode;
  onSelectGoal: (goalId: string) => void;
  onChangeViewMode: (mode: GoalViewMode) => void;
}

export default function GoalsSidebar({
  visibleGoals,
  selectedGoalId,
  viewMode,
  onSelectGoal,
  onChangeViewMode,
}: GoalsSidebarProps) {
  return (
    <aside className="flex-1 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-background-dark/50">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
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
            const statusMeta = getStatusMeta(goal.status);
            const active = selectedGoalId === goal.id;

            return (
              <button
                key={goal.id}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary/10 border-l-4 border-primary rounded-r-lg'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => onSelectGoal(goal.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                  <span className="text-[10px] text-slate-500">{new Date(goal.updatedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{goal.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{goal.description || 'No description yet'}</p>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
