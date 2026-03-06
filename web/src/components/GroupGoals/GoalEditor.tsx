import { useEffect, useState } from 'react';
import SimpleMarkdownEditor from '../SimpleMarkdownEditor';
import ConfirmModal from '../ConfirmModal';
import type { GoalViewModel } from './types';

interface GoalEditorProps {
  selectedGoal: GoalViewModel;
  saving: boolean;
  onUpdateGoalLocal: (goalId: string, updater: (goal: GoalViewModel) => GoalViewModel) => void;
  onSaveGoal: () => void;
  onArchiveGoal: () => void;
  onDeleteGoal: () => void;
  onBackToList?: () => void;
}

export default function GoalEditor({
  selectedGoal,
  saving,
  onUpdateGoalLocal,
  onSaveGoal,
  onArchiveGoal,
  onDeleteGoal,
  onBackToList,
}: GoalEditorProps) {
  const [draftTitle, setDraftTitle] = useState(selectedGoal.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setDraftTitle(selectedGoal.title);
  }, [selectedGoal.id, selectedGoal.title]);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          {onBackToList && (
            <button
              className="lg:hidden flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/40 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={onBackToList}
            >
              <span className="material-icons text-base">arrow_back</span>
              Back
            </button>
          )}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Goal Editor</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-60"
            onClick={onSaveGoal}
            disabled={saving}
          >
            <span className="material-icons text-base">save</span>
            Save Goal
          </button>
          {selectedGoal.status !== 'archived' && (
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={onArchiveGoal}
            >
              <span className="material-icons text-base">archive</span>
              Archive
            </button>
          )}
          {selectedGoal.status === 'archived' && (
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              onClick={() => setShowDeleteConfirm(true)}
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
            <input
              className="w-full bg-transparent border-none text-3xl font-extrabold text-slate-900 dark:text-white focus:ring-0 p-0 placeholder-slate-700"
              type="text"
              value={draftTitle}
              placeholder="Untitled Goal"
              onChange={(event) => {
                const title = event.target.value;
                setDraftTitle(title);
                onUpdateGoalLocal(selectedGoal.id, (goal) => ({ ...goal, title }));
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
            <SimpleMarkdownEditor
              value={selectedGoal.description}
              rows={10}
              onChange={(nextValue) => {
                onUpdateGoalLocal(selectedGoal.id, (goal) => ({
                  ...goal,
                  description: nextValue,
                }));
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Success Metrics</label>
              <div className="space-y-3">
                {selectedGoal.successMetrics.map((metric, index) => (
                  <div
                    key={`metric-${index}`}
                    className="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <span className="material-icons text-primary text-lg">check_circle</span>
                    <input
                      className="flex-1 bg-transparent border-none p-0 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0"
                      type="text"
                      value={metric}
                      onChange={(event) => {
                        const value = event.target.value;
                        onUpdateGoalLocal(selectedGoal.id, (goal) => {
                          const next = [...goal.successMetrics];
                          next[index] = value;
                          return { ...goal, successMetrics: next };
                        });
                      }}
                    />
                    <button
                      type="button"
                      className="h-6 w-6 shrink-0 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Delete metric"
                      onClick={() => {
                        onUpdateGoalLocal(selectedGoal.id, (goal) => {
                          const next = goal.successMetrics.filter((_, idx) => idx !== index);
                          return { ...goal, successMetrics: next };
                        });
                      }}
                    >
                      <span className="material-icons text-base">close</span>
                    </button>
                  </div>
                ))}
                <button
                  className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 px-2"
                  type="button"
                  onClick={() => {
                    const nextMetrics = [...selectedGoal.successMetrics, ''];
                    onUpdateGoalLocal(selectedGoal.id, (goal) => ({ ...goal, successMetrics: nextMetrics }));
                  }}
                >
                  <span className="material-icons text-sm">add</span>
                  Add Metric
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Constraints</label>
              <div className="space-y-3">
                {selectedGoal.constraints.map((constraint, index) => (
                  <div
                    key={`constraint-${index}`}
                    className="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <span className="material-icons text-amber-500 text-lg">warning</span>
                    <input
                      className="flex-1 bg-transparent border-none p-0 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0"
                      type="text"
                      value={constraint}
                      onChange={(event) => {
                        const value = event.target.value;
                        onUpdateGoalLocal(selectedGoal.id, (goal) => {
                          const next = [...goal.constraints];
                          next[index] = value;
                          return { ...goal, constraints: next };
                        });
                      }}
                    />
                    <button
                      type="button"
                      className="h-6 w-6 shrink-0 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Delete constraint"
                      onClick={() => {
                        onUpdateGoalLocal(selectedGoal.id, (goal) => {
                          const next = goal.constraints.filter((_, idx) => idx !== index);
                          return { ...goal, constraints: next };
                        });
                      }}
                    >
                      <span className="material-icons text-base">close</span>
                    </button>
                  </div>
                ))}
                <button
                  className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 px-2"
                  type="button"
                  onClick={() => {
                    const nextConstraints = [...selectedGoal.constraints, ''];
                    onUpdateGoalLocal(selectedGoal.id, (goal) => ({ ...goal, constraints: nextConstraints }));
                  }}
                >
                  <span className="material-icons text-sm">add</span>
                  Add Constraint
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Confirmation"
        message="Are you sure you want to delete this goal?"
        confirmText="Delete"
        confirmTone="danger"
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await onDeleteGoal();
          setShowDeleteConfirm(false);
        }}
      />
    </>
  );
}
