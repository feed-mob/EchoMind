import type { GoalViewModel } from './types';

interface GoalDetailViewProps {
  selectedGoal: GoalViewModel;
  onAiEvaluate: () => void;
  onEdit: () => void;
  onArchiveGoal: () => void;
  onDeleteGoal: () => void;
}

export default function GoalDetailView({
  selectedGoal,
  onAiEvaluate,
  onEdit,
  onArchiveGoal,
  onDeleteGoal,
}: GoalDetailViewProps) {
  return (
    <>
      <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
        </div>
        <div className="flex items-center gap-3">
          {selectedGoal.status !== 'archived' && (
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={onArchiveGoal}
            >
              <span className="material-icons text-base">archive</span>
              Archive
            </button>
          )}
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
            onClick={onEdit}
          >
            <span className="material-icons text-base">edit</span>
            Edit
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
            onClick={onAiEvaluate}
          >
            <span className="material-icons text-base">auto_fix_high</span>
            AI Evaluate
          </button>
          {selectedGoal.status === 'archived' && (
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              onClick={onDeleteGoal}
            >
              <span className="material-icons text-base">delete</span>
              Delete
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto py-10 px-8 space-y-8">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Goal Title</label>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {selectedGoal.title || 'Untitled Goal'}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedGoal.description || 'No description yet.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Success Metrics</label>
              <div className="space-y-3">
                {selectedGoal.successMetrics.length === 0 ? (
                  <div className="text-sm text-slate-400">No success metrics.</div>
                ) : (
                  selectedGoal.successMetrics.map((metric, index) => (
                    <div
                      key={`metric-detail-${index}`}
                      className="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <span className="material-icons text-primary text-lg">check_circle</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{metric || '(empty)'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Constraints</label>
              <div className="space-y-3">
                {selectedGoal.constraints.length === 0 ? (
                  <div className="text-sm text-slate-400">No constraints.</div>
                ) : (
                  selectedGoal.constraints.map((constraint, index) => (
                    <div
                      key={`constraint-detail-${index}`}
                      className="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <span className="material-icons text-amber-500 text-lg">warning</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{constraint || '(empty)'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
