interface GoalDetailActionsProps {
  status: string;
  onShare: () => void;
  onEdit: () => void;
  onArchiveGoal: () => void;
  onAiEvaluate: () => void;
  onDeleteGoal: () => void;
}

export default function GoalDetailActions({
  status,
  onShare,
  onEdit,
  onArchiveGoal,
  onAiEvaluate,
  onDeleteGoal,
}: GoalDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 dark:border-slate-800 dark:bg-slate-900/50">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800"
        onClick={onShare}
      >
        <span className="material-icons text-base">share</span>
        Share
      </button>

      <div className="flex flex-wrap items-center gap-3">
        {status !== 'archived' && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={onArchiveGoal}
          >
            <span className="material-icons text-base">archive</span>
            Archive
          </button>
        )}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={onEdit}
        >
          <span className="material-icons text-base">edit</span>
          Edit
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          onClick={onAiEvaluate}
        >
          <span className="material-icons text-base">auto_fix_high</span>
          AI Evaluate
        </button>
        {status === 'archived' && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
            onClick={onDeleteGoal}
          >
            <span className="material-icons text-base">delete</span>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
