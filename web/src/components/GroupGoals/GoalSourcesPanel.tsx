import { useMemo } from 'react';
import type { GoalViewModel } from './types';
import type { AiEvaluationSetting } from '../../service';
import type { GoalIdeaSummary, GoalSourceItem } from './GoalDetailShared';

interface GoalSourcesPanelProps {
  selectedGoal: GoalViewModel;
  selectedIdea: GoalIdeaSummary | null;
  otherIdeas: GoalIdeaSummary[];
  selectedSetting: AiEvaluationSetting | null;
}

export default function GoalSourcesPanel({
  selectedGoal,
  selectedIdea,
  otherIdeas,
  selectedSetting,
}: GoalSourcesPanelProps) {
  const sourceItems = useMemo(() => {
    const items: GoalSourceItem[] = [];

    items.push({
      id: 'goal-brief',
      title: selectedGoal.title || 'Goal brief',
      description: selectedGoal.description || 'This goal does not have a description yet.',
      badge: 'Goal',
      action: 'View',
      icon: 'flag',
      accentClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
      meta: `Updated ${new Date(selectedGoal.updatedAt).toLocaleDateString()}`,
    });

    if (selectedIdea) {
      items.push({
        id: `selected-idea-${selectedIdea.id}`,
        title: selectedIdea.title,
        description: selectedIdea.review || 'Selected idea review is not available yet.',
        badge: 'Top Pick',
        action: 'Review',
        icon: 'lightbulb',
        accentClass: 'bg-primary/10 text-primary',
        meta: `${selectedIdea.rank ? `Rank #${selectedIdea.rank}` : 'Rank pending'}${selectedIdea.score !== null ? ` • Score ${selectedIdea.score}/100` : ''}`,
      });
    }

    if (selectedSetting) {
      items.push({
        id: `setting-${selectedSetting.id}`,
        title: `${selectedSetting.model} evaluation`,
        description: `Impact ${selectedSetting.impactWeight}% • Feasibility ${selectedSetting.feasibilityWeight}% • Originality ${selectedSetting.originalityWeight}%`,
        badge: 'AI Setting',
        action: 'Inspect',
        icon: 'tune',
        accentClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        meta: `Created ${new Date(selectedSetting.createdAt).toLocaleDateString()}`,
      });
    }

    otherIdeas.slice(0, 3).forEach((idea) => {
      items.push({
        id: `idea-${idea.id}`,
        title: idea.title,
        description: idea.review || 'No review content yet.',
        badge: 'Alternative',
        action: 'Compare',
        icon: 'analytics',
        accentClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        meta: `${idea.rank ? `Rank #${idea.rank}` : 'Unranked'}${idea.score !== null ? ` • Score ${idea.score}/100` : ''}`,
      });
    });

    return items;
  }, [otherIdeas, selectedGoal.description, selectedGoal.title, selectedGoal.updatedAt, selectedIdea, selectedSetting]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Information Sources</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Supporting context collected from this goal, AI evaluation, and related ideas.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <span className="material-icons text-base">add</span>
          New Source
        </button>
      </div>

      {sourceItems.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-400">
          No sources available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {sourceItems.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ${item.accentClass}`}>
                <span className="material-icons">{item.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
              <div className="hidden flex-none text-right sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.meta}</p>
              </div>
              <button
                type="button"
                className="text-sm font-bold text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
              >
                {item.action}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
