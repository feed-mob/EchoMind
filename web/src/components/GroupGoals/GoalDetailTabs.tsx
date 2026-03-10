import type { GoalDetailTab } from './GoalDetailShared';

interface GoalDetailTabsProps {
  activeTab: GoalDetailTab;
  onChange: (tab: GoalDetailTab) => void;
  onBackToList?: () => void;
}

export default function GoalDetailTabs({ activeTab, onChange, onBackToList }: GoalDetailTabsProps) {
  return (
    <div className="mb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-4">
        {onBackToList && (
          <button
            type="button"
            className="lg:hidden inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={onBackToList}
          >
            <span className="material-icons text-base">arrow_back</span>
            Back
          </button>
        )}
        <div className="flex items-center gap-6">
          <button
            type="button"
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'detail'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            onClick={() => onChange('detail')}
          >
            Detail
          </button>
          <button
            type="button"
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'sources'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            onClick={() => onChange('sources')}
          >
            Sources
          </button>
        </div>
      </div>
    </div>
  );
}
