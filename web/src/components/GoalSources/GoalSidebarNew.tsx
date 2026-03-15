import type { Goal } from './types';

interface GoalSidebarNewProps {
  goals: Goal[];
  selectedGoalId: string;
  onSelectGoal: (goalId: string) => void;
}

const statusColorMap: Record<string, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-300 dark:bg-slate-600',
};

export default function GoalSidebarNew({
  goals,
  selectedGoalId,
  onSelectGoal,
}: GoalSidebarNewProps) {
  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between">
      <div className="p-4 flex flex-col gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-slate-900 dark:text-white text-lg font-extrabold">My Goals</h2>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {goals.map((goal) => {
            const isActive = selectedGoalId === goal.id;
            const statusColorClass = statusColorMap[goal.statusColor] || 'bg-slate-300';

            return (
              <a
                key={goal.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectGoal(goal.id);
                }}
                className={`flex flex-col px-3 py-3 rounded-r-lg transition-colors group ${
                  isActive
                    ? 'bg-primary/10 border-l-4 border-primary'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-bold ${
                      isActive
                        ? 'text-primary'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-primary'
                    } transition-colors`}
                  >
                    {goal.title}
                  </span>
                  <span className={`size-2 rounded-full ${statusColorClass}`}></span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {goal.subtitle}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
