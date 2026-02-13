import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type Group } from '../services/api';
import GoalEditor from '../components/group-goals/GoalEditor';
import GoalDetailView from '../components/group-goals/GoalDetailView';
import GoalsSidebar from '../components/group-goals/GoalsSidebar';
import GroupTopNav from '../components/GroupTopNav';
import type { GoalViewMode, GoalViewModel } from '../components/group-goals/types';
import { normalizeGoal } from '../components/group-goals/utils';

export default function GroupGoals() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [goals, setGoals] = useState<GoalViewModel[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<GoalViewMode>('active');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupData, goalsData] = await Promise.all([
          api.groups.getById(groupId),
          api.goals.listByGroup(groupId),
        ]);

        const mappedGoals = goalsData.map(normalizeGoal);
        setGroup(groupData);
        setGoals(mappedGoals);
        setLoadError(null);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load goals page');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [groupId]);

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

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? null;

  const updateGoalLocal = (goalId: string, updater: (goal: GoalViewModel) => GoalViewModel) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;
        return updater(goal);
      })
    );
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
      });
      setGoals((prev) => prev.map((goal) => (goal.id === goalId ? normalizeGoal(updated) : goal)));
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  const createGoal = async () => {
    if (!groupId) return;

    try {
      setSaving(true);
      const created = await api.goals.create(groupId, {
        title: 'New Goal',
        description: '',
        status: 'draft',
        successMetrics: [''],
        constraints: [''],
      });
      const next = normalizeGoal(created);
      setGoals((prev) => [next, ...prev]);
      setViewMode('active');
      setSelectedGoalId(next.id);
      setIsEditing(true);
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  const archiveGoal = async () => {
    if (!selectedGoal) return;
    const goalId = selectedGoal.id;
    updateGoalLocal(goalId, (goal) => ({ ...goal, status: 'archived' }));
    await persistGoal(goalId, { status: 'archived' });
  };

  const saveSelectedGoal = async () => {
    if (!selectedGoal) return;
    await persistGoal(selectedGoal.id, {
      title: selectedGoal.title,
      description: selectedGoal.description,
      status: selectedGoal.status,
      successMetrics: selectedGoal.successMetrics,
      constraints: selectedGoal.constraints,
    });
    setIsEditing(false);
  };

  const deleteGoal = async () => {
    if (!selectedGoal) return;
    if (!confirm('Are you sure you want to delete this goal?')) return;

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

        <div className="flex-1 flex overflow-hidden">
          <GoalsSidebar
            visibleGoals={visibleGoals}
            selectedGoalId={selectedGoalId}
            viewMode={viewMode}
            searchText={searchText}
            onSelectGoal={(goalId) => {
              setSelectedGoalId(goalId);
              setIsEditing(false);
            }}
            onSearchChange={setSearchText}
            onChangeViewMode={setViewMode}
            onCreateGoal={() => void createGoal()}
          />

          <section className="flex-1 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-background-dark">
            {selectedGoal ? (
              isEditing ? (
                <GoalEditor
                  selectedGoal={selectedGoal}
                  saving={saving}
                  onUpdateGoalLocal={updateGoalLocal}
                  onSaveGoal={() => void saveSelectedGoal()}
                  onArchiveGoal={() => void archiveGoal()}
                  onDeleteGoal={() => void deleteGoal()}
                />
              ) : (
                <GoalDetailView
                  selectedGoal={selectedGoal}
                  onAiEvaluate={() => navigate(`/group/${group.id}/ai-evaluate?goalId=${selectedGoal.id}`)}
                  onEdit={() => setIsEditing(true)}
                  onArchiveGoal={() => void archiveGoal()}
                  onDeleteGoal={() => void deleteGoal()}
                />
              )
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <span className="material-icons text-6xl mb-4">flag</span>
                  <p className="text-sm">Select a goal to view details</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
