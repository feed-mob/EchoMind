import { useEffect, useState } from 'react';
import type { GoalViewModel } from './types';
import type { AiEvaluationSetting } from '../../service';
import ConfirmModal from '../ConfirmModal';
import GoalDetailContent from './GoalDetailContent';
import GoalDetailTabs from './GoalDetailTabs';
import GoalSourcesPanel from './GoalSourcesPanel';
import type { GoalDetailTab, GoalIdeaSummary } from './GoalDetailShared';
import { getStatusMeta } from './utils';

interface GoalDetailViewProps {
  selectedGoal: GoalViewModel;
  selectedIdea: { id: string; title: string; rank: number | null; score: number | null; review: string | null } | null;
  otherIdeas: Array<{ id: string; title: string; rank: number | null; score: number | null; review: string | null }>;
  selectedSetting: AiEvaluationSetting | null;
  onAiEvaluate: () => void;
  onShare: () => void;
  onEdit: () => void;
  onArchiveGoal: () => void;
  onDeleteGoal: () => void;
  onBackToList?: () => void;
}

const getGoalHeroBackground = () => {
  const escapeSvgText = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="480" viewBox="0 0 1600 480" fill="none">
    <rect width="1600" height="480" fill="#0f172a"/>
    <rect width="1600" height="480" fill="url(#bg)"/>
    <circle cx="1320" cy="88" r="192" fill="#3b82f6" fill-opacity="0.28"/>
    <circle cx="1180" cy="360" r="220" fill="#22c55e" fill-opacity="0.12"/>
    <circle cx="350" cy="60" r="160" fill="#f8fafc" fill-opacity="0.08"/>
    <path d="M0 370C155 324 270 296 428 304C598 313 690 388 858 394C1063 401 1201 265 1400 240C1496 228 1568 237 1600 244V480H0V370Z" fill="#ffffff" fill-opacity="0.08"/>
    <path d="M113 117H438" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2" stroke-linecap="round"/>
    <path d="M113 149H602" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2" stroke-linecap="round"/>
    <defs>
      <linearGradient id="bg" x1="146" y1="48" x2="1387" y2="448" gradientUnits="userSpaceOnUse">
        <stop stop-color="#1d4ed8"/>
        <stop offset="0.48" stop-color="#0f172a"/>
        <stop offset="1" stop-color="#14532d"/>
      </linearGradient>
    </defs>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

export default function GoalDetailView({
  selectedGoal,
  selectedIdea,
  otherIdeas,
  selectedSetting,
  onAiEvaluate,
  onShare,
  onEdit,
  onArchiveGoal,
  onDeleteGoal,
  onBackToList,
}: GoalDetailViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<GoalDetailTab>('detail');
  const statusMeta = getStatusMeta(selectedGoal.status);
  const heroBackgroundImage = getGoalHeroBackground();

  useEffect(() => {
    setActiveTab('detail');
  }, [selectedGoal.id]);

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto pb-10">
          <section
            className="relative flex min-h-[260px] items-end overflow-hidden px-6 pb-8 pt-16 sm:px-8 lg:min-h-[320px]"
            style={{ backgroundImage: heroBackgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/78 to-background-light/10 dark:from-background-dark dark:via-background-dark/72 dark:to-background-dark/10" />
            <div className="relative z-10 flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase text-white">
                  {statusMeta.label}
                </span>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                  {selectedGoal.title || 'Untitled Goal'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
                  {selectedGoal.description || 'No description yet.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {selectedGoal.creatorName && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 dark:bg-slate-900/60">
                      <span className="material-icons text-sm">person</span>
                      {selectedGoal.creatorName}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 dark:bg-slate-900/60">
                    <span className="material-icons text-sm">schedule</span>
                    Updated {new Date(selectedGoal.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="px-6 pt-6 sm:px-8">
            <GoalDetailTabs activeTab={activeTab} onChange={setActiveTab} onBackToList={onBackToList} />
          </div>

          <div className="px-6 pt-2 sm:px-8">
            {activeTab === 'detail' ? (
              <GoalDetailContent
                selectedGoal={selectedGoal}
                selectedIdea={selectedIdea as GoalIdeaSummary | null}
                otherIdeas={otherIdeas as GoalIdeaSummary[]}
                selectedSetting={selectedSetting}
                onAiEvaluate={onAiEvaluate}
                onShare={onShare}
                onEdit={onEdit}
                onArchiveGoal={onArchiveGoal}
                onDeleteGoal={() => setShowDeleteConfirm(true)}
              />
            ) : (
              <GoalSourcesPanel
                selectedGoal={selectedGoal}
                selectedIdea={selectedIdea as GoalIdeaSummary | null}
                otherIdeas={otherIdeas as GoalIdeaSummary[]}
                selectedSetting={selectedSetting}
              />
            )}
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
