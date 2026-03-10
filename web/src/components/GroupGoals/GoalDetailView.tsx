import { useEffect, useState } from 'react';
import type { GoalViewModel } from './types';
import type { AiEvaluationSetting } from '../../service';
import ConfirmModal from '../ConfirmModal';
import GoalDetailContent from './GoalDetailContent';
import GoalDetailTabs from './GoalDetailTabs';
import GoalSourcesPanel from './GoalSourcesPanel';
import type { GoalDetailTab, GoalIdeaSummary } from './GoalDetailShared';

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

  useEffect(() => {
    setActiveTab('detail');
  }, [selectedGoal.id]);

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto px-8 pt-6 pb-10">
          <GoalDetailTabs activeTab={activeTab} onChange={setActiveTab} onBackToList={onBackToList} />

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
