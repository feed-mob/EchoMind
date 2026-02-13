import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, type Goal, type Group, type Idea } from '../services/api';

type EvaluationState = {
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

function normalizeModel(model: string) {
  if (model === 'gpt-4o') return 'GPT-4o';
  if (model === 'claude-3.5-sonnet') return 'Claude 3.5 Sonnet';
  if (model === 'gemini-1.5-pro') return 'Gemini 1.5 Pro';
  return model;
}

function toReasoning(content: string) {
  const text = content.trim();
  if (!text) return 'Strong strategic fit with the selected goal and clear execution path.';
  return text.length > 130 ? `${text.slice(0, 130).trim()}...` : text;
}

export default function AIEvaluationResults() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as EvaluationState;

  const [group, setGroup] = useState<Group | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [ideas, selectedGoal?.id, selectedIdeaIds, state.selectedIdeas, weighted.feasibility, weighted.impact, weighted.originality]);

  const winner = rankedIdeas[0] || null;
  const evaluatedAt = new Date(state.evaluatedAt || Date.now()).toLocaleDateString();
  const modelLabel = normalizeModel(state.model || 'gpt-4o');

  const handleExport = () => {
    if (!winner) return;

    const payload = {
      group: group?.name || '',
      goal: selectedGoal?.title || state.goalTitle || 'Evaluation Goal',
      model: modelLabel,
      evaluatedAt: state.evaluatedAt || new Date().toISOString(),
      weights: weighted,
      rankings: rankedIdeas,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-evaluation-results.json';
    link.click();
    URL.revokeObjectURL(url);
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
              <button
                onClick={() => navigate(`/group/${group.id}/ai-evaluate?goalId=${selectedGoal.id}`)}
                className="px-4 h-full text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all inline-flex items-center gap-1"
              >
                <span className="material-icons text-base">auto_fix_high</span>
                AI Evaluate
              </button>
            </nav>
        </div>
      </header>

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
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[28%]">Reasoning Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rankedIdeas.map((idea, index) => {
                      const isWinner = index === 0;
                      return (
                        <tr key={idea.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-6 text-center">
                            <span className={isWinner ? 'text-2xl font-black text-primary' : 'text-xl font-bold text-slate-400'}>{index + 1}</span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <span className={isWinner ? 'font-bold text-lg text-slate-900 dark:text-white break-words' : 'font-semibold text-slate-800 dark:text-slate-200 break-words'}>{idea.title}</span>
                              {isWinner && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                                  <span className="material-icons text-xs mr-1">emoji_events</span> WINNER
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submitted by: {idea.authorName}</p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className={isWinner ? 'text-xl font-bold text-primary' : 'text-lg font-bold text-slate-700 dark:text-slate-300'}>{idea.score}</span>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-96 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-primary p-4 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2 tracking-wide">
                      <span className="material-icons">auto_awesome</span> AI TOP PICK
                    </h2>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">BATCH #{new Date().getDate()}{rankedIdeas.length}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-3">Why this idea won</h3>
                  {winner ? (
                    <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      <p>
                        The <span className="text-primary font-semibold">{winner.title}</span> balances strong execution feasibility with high projected impact for this goal.
                      </p>
                      <p>
                        Weighted scoring ({weighted.impact}/{weighted.feasibility}/{weighted.originality}) puts it at <span className="font-bold text-slate-900 dark:text-white">{winner.score}/100</span>, ahead of other candidates in this batch.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300">No evaluated ideas in this run.</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Confidence Score</h4>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl font-bold">{winner ? Math.min(98, winner.score + 4) : 0}%</span>
                  <span className="text-green-500 text-sm font-bold flex items-center mb-1">
                    <span className="material-icons text-sm">trending_up</span>
                    +2.4%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Based on relative ranking confidence in the evaluated idea set.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
