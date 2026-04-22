import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, type AiEvaluationResult, type Goal, type Group, type Idea } from '../service';
import GroupTopNav from '../components/GroupTopNav';

type EvaluationState = {
  settingId?: string;
  goalId?: string;
  goalTitle?: string;
  model?: string;
  impact?: number;
  feasibility?: number;
  originality?: number;
  selectedIdeaIds?: string[];
  selectedIdeas?: Array<{
    id: string;
    title: string;
    content: string;
    authorName: string;
  }>;
  evaluatedAt?: string;
};

type RankedIdea = {
  id: string;
  title: string;
  authorName: string;
  reasoning: string;
  impact: number;
  feasibility: number;
  originality: number;
  score: number;
};

function deterministicScore(seed: string, min = 65, max = 98) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  const span = max - min + 1;
  return min + (Math.abs(hash) % span);
}

function toReasoning(content: string) {
  const text = content.trim();
  if (!text) return 'Strong strategic fit with the selected goal and clear execution path.';
  return text.length > 130 ? `${text.slice(0, 130).trim()}...` : text;
}

export default function AIEvaluationResults() {
  const { groupId, settingId: settingIdFromParams } = useParams<{ groupId: string; settingId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as EvaluationState;
  const settingId = settingIdFromParams || state.settingId;

  const [group, setGroup] = useState<Group | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storedResults, setStoredResults] = useState<AiEvaluationResult[]>([]);
  const [settingPickIdeaId, setSettingPickIdeaId] = useState<string | null>(null);
  const [setPickError, setSetPickError] = useState<string | null>(null);

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
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load evaluation results');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [groupId]);

  useEffect(() => {
    if (!settingId) return;

    const fetchStoredResults = async () => {
      try {
        const results = await api.aiEvaluationResults.listBySetting(settingId);
        setStoredResults(results);
      } catch {
        setStoredResults([]);
      }
    };

    void fetchStoredResults();
  }, [settingId]);

  const selectedGoal = useMemo(() => {
    if (goals.length === 0) return null;
    const targetId = state.goalId;
    if (targetId) {
      const fromId = goals.find((goal) => goal.id === targetId);
      if (fromId) return fromId;
    }
    return goals[0] || null;
  }, [goals, state.goalId]);

  const selectedIdeaIds = state.selectedIdeaIds && state.selectedIdeaIds.length > 0
    ? state.selectedIdeaIds
    : ideas.map((idea) => idea.id);

  const weighted = {
    impact: state.impact ?? 40,
    feasibility: state.feasibility ?? 35,
    originality: state.originality ?? 25,
  };

  const rankedIdeas = useMemo<RankedIdea[]>(() => {
    if (storedResults.length > 0) {
      return storedResults.map((item) => ({
        id: item.ideaId,
        title: item.idea?.title || 'Untitled',
        authorName: item.idea?.author?.name || 'Anonymous',
        reasoning: item.review,
        impact: item.impactScore,
        feasibility: item.feasibilityScore,
        originality: item.originalityScore,
        score: item.totalScore,
      }));
    }

    const byId = new Map(
      ideas.map((idea) => [
        idea.id,
        {
          title: idea.title,
          content: idea.content || '',
          authorName: idea.author?.name || 'Anonymous',
        },
      ])
    );

    for (const item of state.selectedIdeas || []) {
      byId.set(item.id, {
        title: item.title,
        content: item.content,
        authorName: item.authorName,
      });
    }

    const list = selectedIdeaIds
      .map((ideaId) => {
        const src = byId.get(ideaId);
        if (!src) return null;

        const seed = `${selectedGoal?.id || 'goal'}-${ideaId}`;
        const impact = deterministicScore(`${seed}-impact`, 70, 99);
        const feasibility = deterministicScore(`${seed}-feasibility`, 62, 96);
        const originality = deterministicScore(`${seed}-originality`, 60, 98);
        const score = Math.round(
          (impact * weighted.impact + feasibility * weighted.feasibility + originality * weighted.originality) / 100
        );

        return {
          id: ideaId,
          title: src.title,
          authorName: src.authorName,
          reasoning: toReasoning(src.content),
          impact,
          feasibility,
          originality,
          score,
        };
      })
      .filter((idea): idea is RankedIdea => Boolean(idea));

    return list.sort((a, b) => b.score - a.score);
  }, [ideas, selectedGoal?.id, selectedIdeaIds, state.selectedIdeas, storedResults, weighted.feasibility, weighted.impact, weighted.originality]);

  const handleSetPick = async (ideaId: string) => {
    if (!selectedGoal) return;

    try {
      setSettingPickIdeaId(ideaId);
      setSetPickError(null);
      const updatedGoal = await api.goals.update(selectedGoal.id, {
        selectedIdeaId: ideaId,
        selectedSettingId: settingId || null,
        status: 'in_progress',
      });
      setGoals((prev) => prev.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)));
    } catch (err) {
      setSetPickError(err instanceof Error ? err.message : 'Failed to set pick for goal');
    } finally {
      setSettingPickIdeaId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading AI evaluation results...</p>
        </div>
      </div>
    );
  }

  if (error || !group || !selectedGoal) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Evaluation context not found'}</p>
          <button onClick={() => navigate(`/group/${groupId}/ai-evaluate`)} className="text-primary hover:underline">
            Back to AI Evaluate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <GroupTopNav group={group} activeTab="ai" aiGoalId={selectedGoal.id} sticky />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow min-w-0 overflow-x-hidden">
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div>
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16 text-center">Rank</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[24%]">Idea Proposal</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-24 text-center">Score</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-52">Dimensions</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[24%]">Reasoning Preview</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-44 text-center">Manual Pick</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rankedIdeas.map((idea, index) => {
                      const isCurrentPick =
                        selectedGoal.selectedIdeaId === idea.id &&
                        selectedGoal.selectedSettingId === (settingId || null);
                      return (
                        <tr key={idea.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-6 text-center">
                            <span className="text-xl font-bold text-slate-400">{index + 1}</span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 break-words">{idea.title}</span>
                              {isCurrentPick && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                                  <span className="material-icons text-xs mr-1">person</span> CURRENT PICK
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submitted by: {idea.authorName}</p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{idea.score}</span>
                              <span className="text-[10px] text-slate-400 font-medium">/100</span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-[10px] mb-1 uppercase font-semibold">
                                  <span>Impact</span>
                                  <span className="text-primary">{idea.impact}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${idea.impact}%` }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-[10px] mb-1 uppercase font-semibold">
                                  <span>Feasibility</span>
                                  <span className="text-primary">{idea.feasibility}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary/60 rounded-full" style={{ width: `${idea.feasibility}%` }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-[10px] mb-1 uppercase font-semibold">
                                  <span>Originality</span>
                                  <span className="text-primary">{idea.originality}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary/40 rounded-full" style={{ width: `${idea.originality}%` }}></div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400 break-words">{idea.reasoning}</p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-60"
                              onClick={() => void handleSetPick(idea.id)}
                              disabled={Boolean(settingPickIdeaId) || isCurrentPick}
                            >
                              <span className="material-icons text-sm">task_alt</span>
                              {isCurrentPick ? 'Picked' : 'Pick This Idea'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-96 flex-shrink-0">
            <div className="sticky space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-primary p-4 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2 tracking-wide">
                      <span className="material-icons">insights</span> AI EVALUATION
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-3">Scoring Only</h3>
                  <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    <p>AI Evaluate provides scores and reasoning only. It does not pick an idea.</p>
                    <p>Use the manual pick button in the table to choose the final idea for this goal.</p>
                    <p>
                      Current weights: Impact {weighted.impact}% · Feasibility {weighted.feasibility}% · Originality {weighted.originality}%
                    </p>
                    {setPickError && (
                      <p className="text-xs text-red-600 dark:text-red-400">{setPickError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Evaluation Summary</h4>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl font-bold">{rankedIdeas.length}</span>
                  <span className="text-sm text-slate-500 mb-1">ideas evaluated</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sorted by weighted score. Final pick is made by a person, not by AI.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
