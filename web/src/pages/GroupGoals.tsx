import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api, type AiEvaluationResult, type AiEvaluationSetting, type Group, type Idea } from '../service';
import GoalEditor from '../components/GroupGoals/GoalEditor';
import GoalDetailView from '../components/GroupGoals/GoalDetailView';
import GoalsSidebar from '../components/GroupGoals/GoalsSidebar';
import AnimatedSeedling from '../components/GroupGoals/AnimatedSeedling';
import GroupTopNav from '../components/GroupTopNav';
import type { GoalViewMode, GoalViewModel } from '../components/GroupGoals/types';
import { normalizeGoal } from '../components/GroupGoals/utils';

export default function GroupGoals() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [goals, setGoals] = useState<GoalViewModel[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [settings, setSettings] = useState<AiEvaluationSetting[]>([]);
  const [selectedSettingResults, setSelectedSettingResults] = useState<AiEvaluationResult[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<GoalViewMode>('active');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [goalEditorMode, setGoalEditorMode] = useState<'create' | 'edit' | null>(null);
  const [goalDraft, setGoalDraft] = useState<GoalViewModel | null>(null);
  const selectedGoal =
    goalEditorMode === 'create' || goalEditorMode === 'edit'
      ? goalDraft
      : goals.find((goal) => goal.id === selectedGoalId) ?? null;
  const hasDetailPanel = Boolean(selectedGoal);

  const closeDetailPanel = () => {
    setSelectedGoalId('');
    setGoalEditorMode(null);
    setGoalDraft(null);
  };

  const attachGoalCreator = (goal: GoalViewModel, ideaList: Idea[]): GoalViewModel => {
    if (goal.creatorName || !goal.selectedIdeaId) return goal;
    const matchedIdea = ideaList.find((idea) => idea.id === goal.selectedIdeaId);
    if (!matchedIdea) return goal;
    return {
      ...goal,
      creatorName: matchedIdea.author?.name ?? null,
      creatorAvatar: matchedIdea.author?.avatar ?? null,
    };
  };

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupData, goalsData, ideasData, settingsData] = await Promise.all([
          api.groups.getById(groupId),
          api.goals.listByGroup(groupId),
          api.ideas.listByGroup(groupId),
          api.aiEvaluationSettings.listByGroup(groupId),
        ]);

        const mappedGoals = goalsData.map((goal) => attachGoalCreator(normalizeGoal(goal), ideasData));
        setGroup(groupData);
        setGoals(mappedGoals);
        setIdeas(ideasData);
        setSettings(settingsData);
        setLoadError(null);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load goals page');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [groupId]);

  useEffect(() => {
    const selectedSettingId = selectedGoal?.selectedSettingId;
    if (!selectedSettingId) {
      setSelectedSettingResults([]);
      return;
    }

    const fetchSettingResults = async () => {
      try {
        const results = await api.aiEvaluationResults.listBySetting(selectedSettingId);
        setSelectedSettingResults(results);
      } catch {
        setSelectedSettingResults([]);
      }
    };

    void fetchSettingResults();
  }, [selectedGoal?.selectedSettingId]);

  const visibleGoals = useMemo(() => {
    const byMode = goals.filter((goal) =>
      viewMode === 'active' ? goal.status !== 'archived' : goal.status === 'archived'
    );

    const query = searchText.trim().toLowerCase();
    if (!query) return byMode;

    return byMode.filter((goal) => {
      return (
        goal.title.toLowerCase().includes(query) ||
        goal.description.toLowerCase().includes(query)
      );
    });
  }, [goals, searchText, viewMode]);

  const updateGoalLocal = (goalId: string, updater: (goal: GoalViewModel) => GoalViewModel) => {
    if (goalEditorMode === 'create' || goalEditorMode === 'edit') {
      setGoalDraft((prev) => (prev ? updater(prev) : prev));
      return;
    }
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? updater(goal) : goal)));
  };

  const persistGoal = async (goalId: string, data: Partial<GoalViewModel>) => {
    try {
      setSaving(true);
      const updated = await api.goals.update(goalId, {
        title: data.title,
        description: data.description,
        status: data.status,
        successMetrics: data.successMetrics,
        constraints: data.constraints,
        selectedIdeaId: data.selectedIdeaId,
        selectedSettingId: data.selectedSettingId,
      });
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId ? attachGoalCreator(normalizeGoal(updated), ideas) : goal
        )
      );
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  const startCreateGoal = () => {
    const now = new Date().toISOString();
    setViewMode('active');
    setSelectedGoalId('');
    setGoalEditorMode('create');
    setGoalDraft({
      id: 'draft-goal',
      title: '',
      description: '',
      status: 'draft',
      selectedIdeaId: null,
      selectedSettingId: null,
      successMetrics: [''],
      constraints: [''],
      createdAt: now,
      updatedAt: now,
    });
    setSaveError(null);
  };

  const archiveGoal = async () => {
    if (!selectedGoal) return;
    const goalId = selectedGoal.id;
    updateGoalLocal(goalId, (goal) => ({ ...goal, status: 'archived' }));
    await persistGoal(goalId, { status: 'archived' });
  };

  const saveSelectedGoal = async () => {
    if (!groupId || !selectedGoal) return;

    const title = selectedGoal.title.trim();
    if (!title) {
      setSaveError('Goal title is required');
      return;
    }

    if (goalEditorMode === 'create') {
      if (!user?.id) {
        setSaveError('You must be signed in to create a goal');
        return;
      }

      try {
        setSaving(true);
        const created = await api.goals.create(groupId, {
          title,
          description: selectedGoal.description,
          status: selectedGoal.status,
          successMetrics: selectedGoal.successMetrics,
          constraints: selectedGoal.constraints,
          creatorId: user.id,
        });
        const next = attachGoalCreator(normalizeGoal(created), ideas);
        setGoals((prev) => [next, ...prev]);
        setSelectedGoalId(next.id);
        setGoalDraft(null);
        setGoalEditorMode(null);
        setSaveError(null);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to create goal');
      } finally {
        setSaving(false);
      }
      return;
    }

    await persistGoal(selectedGoal.id, {
      title,
      description: selectedGoal.description,
      status: selectedGoal.status,
      successMetrics: selectedGoal.successMetrics,
      constraints: selectedGoal.constraints,
    });
    setGoalDraft(null);
    setGoalEditorMode(null);
  };

  const deleteGoal = async () => {
    if (!selectedGoal) return;

    if (goalEditorMode === 'create') {
      setGoalDraft(null);
      setGoalEditorMode(null);
      return;
    }

    const goalId = selectedGoal.id;
    try {
      setSaving(true);
      await api.goals.delete(goalId);
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      setSelectedGoalId('');
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete goal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (loadError || !group) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-red-500 mb-4">{loadError || 'Group not found'}</p>
          <button onClick={() => navigate('/group')} className="text-primary hover:underline">
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      <main className="flex-1 flex flex-col overflow-hidden">
        <GroupTopNav group={group} activeTab="goals" aiGoalId={selectedGoal?.id} />
        {saveError && (
          <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-red-200 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-300">
            {saveError}
          </div>
        )}

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <GoalsSidebar
            className={hasDetailPanel ? 'hidden lg:flex' : 'flex'}
            visibleGoals={visibleGoals}
            selectedGoalId={selectedGoalId}
            viewMode={viewMode}
            searchText={searchText}
            onSelectGoal={(goalId) => {
              setSelectedGoalId(goalId);
              setGoalDraft(null);
              setGoalEditorMode(null);
            }}
            onSearchChange={setSearchText}
            onChangeViewMode={setViewMode}
            onCreateGoal={startCreateGoal}
          />

          <section className={`${hasDetailPanel ? 'flex' : 'hidden lg:flex'} flex-1 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex-col bg-slate-50 dark:bg-background-dark`}>
            {selectedGoal ? (
              goalEditorMode === 'create' || goalEditorMode === 'edit' ? (
                <GoalEditor
                  selectedGoal={selectedGoal}
                  saving={saving}
                  onUpdateGoalLocal={updateGoalLocal}
                  onSaveGoal={() => void saveSelectedGoal()}
                  onArchiveGoal={() => void archiveGoal()}
                  onDeleteGoal={() => void deleteGoal()}
                  onBackToList={closeDetailPanel}
                />
              ) : (
                <GoalDetailView
                  selectedGoal={selectedGoal}
                  selectedIdea={
                    selectedGoal.selectedIdeaId
                      ? (() => {
                          const fromResult = selectedSettingResults.find((item) => item.ideaId === selectedGoal.selectedIdeaId);
                          if (fromResult) {
                            return {
                              id: fromResult.ideaId,
                              title: fromResult.idea?.title || 'Untitled',
                              rank: fromResult.rank,
                              score: fromResult.totalScore,
                              review: fromResult.review,
                            };
                          }
                          const fallback = ideas.find((idea) => idea.id === selectedGoal.selectedIdeaId);
                          if (!fallback) return null;
                          return {
                            id: fallback.id,
                            title: fallback.title,
                            rank: null,
                            score: null,
                            review: null,
                          };
                        })()
                      : null
                  }
                  otherIdeas={selectedSettingResults
                    .filter((item) => item.ideaId !== selectedGoal.selectedIdeaId)
                    .map((item) => ({
                      id: item.ideaId,
                      title: item.idea?.title || 'Untitled',
                      rank: item.rank,
                      score: item.totalScore,
                      review: item.review,
                    }))}
                  selectedSetting={settings.find((setting) => setting.id === selectedGoal.selectedSettingId) || null}
                  onAiEvaluate={() => navigate(`/group/${group.id}/ai-evaluate?goalId=${selectedGoal.id}`)}
                  onShare={() => navigate(`/group/${group.id}/goals/${selectedGoal.id}/share`)}
                  onEdit={() => {
                    setGoalEditorMode('edit');
                    setGoalDraft({ ...selectedGoal });
                  }}
                  onArchiveGoal={() => void archiveGoal()}
                  onDeleteGoal={() => void deleteGoal()}
                  onBackToList={closeDetailPanel}
                />
              )
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <AnimatedSeedling className="mb-4" size={120} />
                  <p className="text-m">Select a goal to track your progress</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
