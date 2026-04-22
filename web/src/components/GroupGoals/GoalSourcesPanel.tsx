import type { GoalViewModel } from './types';
import type { AiEvaluationSetting } from '../../service';
import type { GoalIdeaSummary } from './GoalDetailShared';

interface GoalSourcesPanelProps {
  selectedGoal: GoalViewModel;
  selectedIdea: GoalIdeaSummary | null;
  otherIdeas: GoalIdeaSummary[];
  selectedSetting: AiEvaluationSetting | null;
}

export default function GoalSourcesPanel({
  selectedGoal: _selectedGoal,
  selectedIdea: _selectedIdea,
  otherIdeas: _otherIdeas,
  selectedSetting: _selectedSetting,
}: GoalSourcesPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Coming soon</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sources will be available in a future update.</p>
    </div>
  );
}
