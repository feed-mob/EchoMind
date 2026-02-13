import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, type Goal, type Group, type Idea } from '../services/api';

export default function AIEvaluationSetup() {
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goalIdFromQuery = searchParams.get('goalId') || '';

  const [group, setGroup] = useState<Group | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState(goalIdFromQuery);
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<string[]>([]);
  const [model, setModel] = useState('gemini-1.5-pro');
  const [impact, setImpact] = useState(40);
  const [feasibility, setFeasibility] = useState(35);
  const [originality, setOriginality] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupData, goalsData, ideasData] = await Promise.all([
          api.groups.getById(groupId),
          api.goals.listByGroup(groupId),
          api.ideas.listByGroup(groupId),
        ]);

        setGroup(groupData);
        setGoals(goalsData.filter((goal) => goal.status !== 'archived'));
        setIdeas(ideasData);
        setSelectedIdeaIds(ideasData.map((idea) => idea.id));

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load evaluation setup');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [groupId]);

  useEffect(() => {
    if (goals.length === 0) {
      setSelectedGoalId('');
      return;
    }

    if (goalIdFromQuery && goals.some((goal) => goal.id === goalIdFromQuery)) {
      setSelectedGoalId(goalIdFromQuery);
      return;
    }

    setSelectedGoalId((current) => {
      if (current && goals.some((goal) => goal.id === current)) return current;
      return goals[0]?.id || '';
    });
  }, [goalIdFromQuery, goals]);

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId) || null,
    [goals, selectedGoalId],
  );

  const totalWeight = impact + feasibility + originality;

  const toggleIdeaSelection = (ideaId: string) => {
    setSelectedIdeaIds((prev) =>
      prev.includes(ideaId) ? prev.filter((id) => id !== ideaId) : [...prev, ideaId]
    );
  };

  const selectAllIdeas = () => {
    setSelectedIdeaIds(ideas.map((idea) => idea.id));
  };

  const clearIdeaSelection = () => {
    setSelectedIdeaIds([]);
  };

  const handleRunPick = async () => {
    if (!groupId || !group || !selectedGoalId || selectedIdeaIds.length === 0 || totalWeight !== 100) {
      return;
    }

    const selectedIdeas = ideas
      .filter((idea) => selectedIdeaIds.includes(idea.id))
      .map((idea) => ({
        id: idea.id,
        title: idea.title,
        content: idea.content || '',
        authorName: idea.author?.name || 'Anonymous',
      }));

    try {
      setSubmitting(true);
      setSubmitError(null);

      await api.aiEvaluationSettings.create(groupId, {
        goalId: selectedGoalId,
        model,
        impactWeight: impact,
        feasibilityWeight: feasibility,
        originalityWeight: originality,
        selectedIdeaIds,
      });

      navigate(`/group/${groupId}/ai-evaluated`, {
        state: {
          goalId: selectedGoalId,
          goalTitle: selectedGoal?.title || 'Evaluation Goal',
          model,
          impact,
          feasibility,
          originality,
          selectedIdeaIds,
          selectedIdeas,
          evaluatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save AI evaluation settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading AI evaluation setup...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Group not found'}</p>
          <button
            onClick={() => navigate('/group')}
            className="text-primary hover:underline"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <header className="h-16 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center bg-white/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
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
            <button
              onClick={() => navigate(`/group/${group.id}/goals`)}
              className="px-4 h-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Goals
            </button>
            <button className="px-4 h-full text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all inline-flex items-center gap-1">
              <span className="material-icons text-base">auto_fix_high</span>
              AI Evaluate
            </button>
          </nav>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <section className="max-w-4xl mx-auto mb-10">
            <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Evaluation Goal</label>
            <div className="relative">
              <select
                className="w-full bg-white border border-slate-300 rounded-xl py-4 px-5 text-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer text-slate-900 dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-100"
                value={selectedGoalId}
                onChange={(event) => setSelectedGoalId(event.target.value)}
              >
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="material-icons text-slate-400">expand_more</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">The selected goal provides context for the AI scoring rubrics.</p>
          </section>

          <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium"><span className="text-primary font-bold">{selectedIdeaIds.length}</span> Ideas Selected</span>
              <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
              <button className="text-sm text-primary hover:underline font-medium" onClick={selectAllIdeas}>Select All</button>
              <button className="text-sm text-slate-400 hover:text-white transition-colors" onClick={clearIdeaSelection}>Clear Selection</button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-4">
            {ideas.map((idea) => {
              const checked = selectedIdeaIds.includes(idea.id);
              return (
                <label
                  key={idea.id}
                  className="group bg-white border border-slate-200 p-5 rounded-xl flex items-start gap-5 hover:border-primary/50 transition-all cursor-pointer dark:bg-slate-900/60 dark:border-slate-800"
                >
                  <div className="pt-1">
                    <input
                      className="w-5 h-5 rounded border-slate-700 bg-transparent text-primary focus:ring-primary transition-all"
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleIdeaSelection(idea.id)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{idea.title}</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{idea.content || 'No description provided.'}</p>
                    <div className="flex gap-4 mt-3">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 uppercase tracking-tight">
                        <span className="material-icons text-[14px]">person</span>
                        {idea.author?.name || 'Anonymous'}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 uppercase tracking-tight">
                        <span className="material-icons text-[14px]">calendar_today</span>
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </main>

        <aside className="w-96 bg-white border-l border-slate-200 flex flex-col h-full sticky top-0 shadow-2xl dark:bg-slate-900 dark:border-slate-800">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons text-primary">settings</span>
              Evaluation Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-1">Configure AI model parameters and weights.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Select AI Model</label>
              <div className="space-y-3">
                {[{ id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Largest context window for bulk ideas' }].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      model === item.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500'
                    }`}
                  >
                    <input
                      className="text-primary focus:ring-primary bg-transparent border-slate-600"
                      name="model"
                      type="radio"
                      checked={model === item.id}
                      onChange={() => setModel(item.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Scoring Rubrics</label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${totalWeight === 100 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  Total: {totalWeight}%
                </span>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Impact</span>
                    <span className="text-sm font-bold text-primary">{impact}%</span>
                  </div>
                  <input className="w-full" max="100" min="0" type="range" value={impact} onChange={(e) => setImpact(Number(e.target.value))} />
                  <p className="text-[10px] text-slate-500">Value to customer and business ROI.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Feasibility</span>
                    <span className="text-sm font-bold text-primary">{feasibility}%</span>
                  </div>
                  <input className="w-full" max="100" min="0" type="range" value={feasibility} onChange={(e) => setFeasibility(Number(e.target.value))} />
                  <p className="text-[10px] text-slate-500">Technical effort and resource availability.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Originality</span>
                    <span className="text-sm font-bold text-primary">{originality}%</span>
                  </div>
                  <input className="w-full" max="100" min="0" type="range" value={originality} onChange={(e) => setOriginality(Number(e.target.value))} />
                  <p className="text-[10px] text-slate-500">Market uniqueness and competitive edge.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 dark:bg-slate-900/50 dark:border-slate-800">
            <button
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
              onClick={() => void handleRunPick()}
              disabled={!selectedGoalId || selectedIdeaIds.length === 0 || totalWeight !== 100 || submitting}
            >
              <span className="material-icons">play_arrow</span>
              {submitting ? 'Saving...' : 'Run AI Pick'}
            </button>
            {submitError && <p className="text-center mt-2 text-[10px] text-red-500">{submitError}</p>}
            <p className="text-center mt-3 text-[10px] text-slate-500">Estimated cost: ~0.45 credits</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
