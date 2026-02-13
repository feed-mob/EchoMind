import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type Group, type Idea } from '../services/api';

interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'in_progress' | 'draft' | 'paused' | 'planning' | 'archived';
  updatedLabel: string;
  successMetrics: string[];
  constraints: string[];
}

const initialGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Q4 Market Expansion Strategy',
    status: 'in_progress',
    updatedLabel: '2h ago',
    description:
      'Our primary focus for the fourth quarter is a structured entry into the DACH region. We need to evaluate our current SaaS offering against local competitors and ensure GDPR compliance is front-and-center.\n\nKey pillars include:\n• Localized marketing campaigns\n• Strategic partnership with regional resellers\n• Technical infrastructure localization',
    successMetrics: ['Acquire 50 enterprise leads', '99.9% Regional Uptime'],
    constraints: ['Budget cap: $250k', 'Launch by Dec 15th'],
  },
  {
    id: 'goal-2',
    title: 'Customer Retention AI',
    status: 'draft',
    updatedLabel: 'Yesterday',
    description: 'Evaluating churn prediction models and intervention loops for at-risk users.',
    successMetrics: ['Churn reduction by 12%', 'Increase NPS by 5 points'],
    constraints: ['No PII outside approved systems'],
  },
  {
    id: 'goal-3',
    title: 'Mobile App Redesign v3',
    status: 'paused',
    updatedLabel: 'Oct 12',
    description: 'Focus on onboarding flow improvements and reduced first-session drop-off.',
    successMetrics: ['Improve activation rate by 20%'],
    constraints: ['Reuse existing design system components'],
  },
  {
    id: 'goal-4',
    title: 'Infrastructure Scaling',
    status: 'planning',
    updatedLabel: 'Oct 10',
    description: 'Prepare architecture and observability baseline for 10x user growth.',
    successMetrics: ['P95 latency under 250ms', 'Zero Sev-1 incidents during migration'],
    constraints: ['No more than 2h maintenance windows'],
  },
];

const goalStatusMeta: Record<Goal['status'], { label: string; className: string }> = {
  in_progress: { label: 'In Progress', className: 'text-primary bg-primary/20' },
  draft: { label: 'Draft', className: 'text-slate-400 bg-slate-100 dark:bg-slate-800' },
  paused: { label: 'Paused', className: 'text-amber-500 bg-amber-500/10' },
  planning: { label: 'Planning', className: 'text-emerald-500 bg-emerald-500/10' },
  archived: { label: 'Archived', className: 'text-slate-500 bg-slate-200 dark:bg-slate-700' },
};

export default function GroupGoals() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [selectedGoalId, setSelectedGoalId] = useState(initialGoals[0]?.id ?? '');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState(new Date());

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupData, ideasData] = await Promise.all([
          api.groups.getById(groupId),
          api.ideas.listByGroup(groupId),
        ]);
        setGroup(groupData);
        setIdeas(ideasData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load goals page');
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

  useEffect(() => {
    if (!selectedGoal) {
      setSelectedGoalId(visibleGoals[0]?.id ?? '');
    }
  }, [selectedGoal, visibleGoals]);

  const updateGoal = (goalId: string, updater: (goal: Goal) => Goal) => {
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? updater(goal) : goal)));
    setLastSavedAt(new Date());
  };

  const createGoal = () => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: 'New Goal',
      description: '',
      status: 'draft',
      updatedLabel: 'just now',
      successMetrics: [''],
      constraints: [''],
    };
    setGoals((prev) => [newGoal, ...prev]);
    setViewMode('active');
    setSelectedGoalId(newGoal.id);
    setLastSavedAt(new Date());
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

  if (error || !group) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Group not found'}</p>
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
        <header className="h-16 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-background-dark/50 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/group')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
              aria-label="Back to groups"
            >
              <span className="material-icons">arrow_back</span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">WIDEA</h1>
            </button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            <span className="text-lg font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{group.name}</span>
            <nav className="flex items-center gap-1 h-full">
              <button
                onClick={() => navigate(`/group/${group.id}`)}
                className="px-4 h-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Ideas
              </button>
              <button className="px-4 h-full text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all">
                Goals
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all"
                placeholder="Search goals..."
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>
            <button
              onClick={createGoal}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <span className="material-icons text-sm">add</span> New Goal
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-background-dark/50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${
                  viewMode === 'active'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                onClick={() => setViewMode('active')}
              >
                Active
              </button>
              <button
                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${
                  viewMode === 'archived'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                onClick={() => setViewMode('archived')}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {visibleGoals.length === 0 ? (
              <div className="p-3 text-xs text-slate-400">No goals found.</div>
            ) : (
              visibleGoals.map((goal) => {
                const statusMeta = goalStatusMeta[goal.status];
                const active = selectedGoalId === goal.id;

                return (
                  <button
                    key={goal.id}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-primary/10 border-l-4 border-primary rounded-r-lg'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => setSelectedGoalId(goal.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                      <span className="text-[10px] text-slate-500">{goal.updatedLabel}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{goal.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{goal.description || 'No description yet'}</p>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
              onClick={createGoal}
            >
              <span className="material-icons text-base">add</span>
              New Goal
            </button>
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-slate-50 dark:bg-background-dark">
          {selectedGoal ? (
            <>
              <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Goal Editor</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={() =>
                      updateGoal(selectedGoal.id, (goal) => ({
                        ...goal,
                        status: 'archived',
                        updatedLabel: 'just now',
                      }))
                    }
                  >
                    <span className="material-icons text-base">archive</span>
                    Archive
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors">
                    <span className="material-icons text-base">auto_fix_high</span>
                    AI Evaluate
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto py-10 px-8 space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Goal Title</label>
                    <input
                      className="w-full bg-transparent border-none text-3xl font-extrabold text-slate-900 dark:text-white focus:ring-0 p-0 placeholder-slate-700"
                      type="text"
                      value={selectedGoal.title}
                      onChange={(event) =>
                        updateGoal(selectedGoal.id, (goal) => ({
                          ...goal,
                          title: event.target.value,
                          updatedLabel: 'just now',
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400" type="button">
                          <span className="material-icons text-sm">format_bold</span>
                        </button>
                        <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400" type="button">
                          <span className="material-icons text-sm">format_italic</span>
                        </button>
                        <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400" type="button">
                          <span className="material-icons text-sm">format_list_bulleted</span>
                        </button>
                      </div>
                      <textarea
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-300 p-4 leading-relaxed resize-none"
                        rows={6}
                        value={selectedGoal.description}
                        onChange={(event) =>
                          updateGoal(selectedGoal.id, (goal) => ({
                            ...goal,
                            description: event.target.value,
                            updatedLabel: 'just now',
                          }))
                        }
                      />
                    </div>
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
                              className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0"
                              type="text"
                              value={metric}
                              onChange={(event) =>
                                updateGoal(selectedGoal.id, (goal) => {
                                  const next = [...goal.successMetrics];
                                  next[index] = event.target.value;
                                  return { ...goal, successMetrics: next, updatedLabel: 'just now' };
                                })
                              }
                            />
                          </div>
                        ))}
                        <button
                          className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 px-1"
                          type="button"
                          onClick={() =>
                            updateGoal(selectedGoal.id, (goal) => ({
                              ...goal,
                              successMetrics: [...goal.successMetrics, ''],
                              updatedLabel: 'just now',
                            }))
                          }
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
                              className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0"
                              type="text"
                              value={constraint}
                              onChange={(event) =>
                                updateGoal(selectedGoal.id, (goal) => {
                                  const next = [...goal.constraints];
                                  next[index] = event.target.value;
                                  return { ...goal, constraints: next, updatedLabel: 'just now' };
                                })
                              }
                            />
                          </div>
                        ))}
                        <button
                          className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 px-1"
                          type="button"
                          onClick={() =>
                            updateGoal(selectedGoal.id, (goal) => ({
                              ...goal,
                              constraints: [...goal.constraints, ''],
                              updatedLabel: 'just now',
                            }))
                          }
                        >
                          <span className="material-icons text-sm">add</span>
                          Add Constraint
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Currently Linked Ideas</h3>
                        <p className="text-xs text-slate-500">Collaborative ideas associated with this objective</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <span className="material-icons text-sm">add_link</span>
                        Add Ideas
                      </button>
                    </div>

                    {ideas.length === 0 ? (
                      <div className="text-sm text-slate-400">No ideas available in this group yet.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ideas.slice(0, 3).map((idea) => (
                          <div
                            key={idea.id}
                            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:border-primary/50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-icons text-sm">lightbulb</span>
                              </div>
                              <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity">
                                <span className="material-icons text-sm">link_off</span>
                              </button>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{idea.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{idea.content || 'No description provided.'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <span className="material-icons text-6xl mb-4">flag</span>
                <p className="text-sm">Select a goal to edit</p>
              </div>
            </div>
          )}
        </section>
        </div>
      </main>
    </div>
  );
}
