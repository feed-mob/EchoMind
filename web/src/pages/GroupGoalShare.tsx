import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { api, type AiEvaluationResult, type AiEvaluationSetting, type Goal, type Group, type GroupMember, type Idea } from '../services/api';

type ShareIdea = {
  id: string;
  title: string;
  rank: number | null;
  score: number | null;
  content: string | null;
  review: string | null;
};

const getInitials = (name?: string | null) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NA';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
};

const quarterLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
};

export default function GroupGoalShare() {
  const { groupId, goalId } = useParams<{ groupId: string; goalId: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [selectedSetting, setSelectedSetting] = useState<AiEvaluationSetting | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<ShareIdea | null>(null);
  const [otherIdeas, setOtherIdeas] = useState<ShareIdea[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId || !goalId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupData, goalData, ideasData, settingsData, membersData] = await Promise.all([
          api.groups.getById(groupId),
          api.goals.getById(goalId),
          api.ideas.listByGroup(groupId),
          api.aiEvaluationSettings.listByGroup(groupId),
          api.groups.listMembers(groupId),
        ]);

        setGroup(groupData);
        setGoal(goalData);
        setMembers(membersData);

        const setting = settingsData.find((item) => item.id === goalData.selectedSettingId) || null;
        setSelectedSetting(setting);

        let results: AiEvaluationResult[] = [];
        if (setting?.id) {
          results = await api.aiEvaluationResults.listBySetting(setting.id);
        }

        const toShareIdea = (ideaId: string): ShareIdea | null => {
          const fromResult = results.find((item) => item.ideaId === ideaId);
          const fromIdeaList: Idea | undefined = ideasData.find((item) => item.id === ideaId);
          if (fromResult) {
            return {
              id: fromResult.ideaId,
              title: fromResult.idea?.title || fromIdeaList?.title || 'Untitled',
              rank: fromResult.rank,
              score: fromResult.totalScore,
              content: fromResult.idea?.content || fromIdeaList?.content || null,
              review: fromResult.review,
            };
          }

          if (!fromIdeaList) return null;
          return {
            id: fromIdeaList.id,
            title: fromIdeaList.title,
            rank: null,
            score: null,
            content: fromIdeaList.content || null,
            review: null,
          };
        };

        const nextSelectedIdea = goalData.selectedIdeaId ? toShareIdea(goalData.selectedIdeaId) : null;
        setSelectedIdea(nextSelectedIdea);

        if (goalData.selectedSettingId && results.length > 0) {
          setOtherIdeas(
            results
              .filter((item) => item.ideaId !== goalData.selectedIdeaId)
              .map((item) => ({
                id: item.ideaId,
                title: item.idea?.title || 'Untitled',
                rank: item.rank,
                score: item.totalScore,
                content: item.idea?.content || null,
                review: item.review,
              })),
          );
        } else {
          setOtherIdeas([]);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load share page');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [groupId, goalId]);

  const quarter = useMemo(() => quarterLabel(goal?.createdAt || ''), [goal?.createdAt]);
  const visibleMembers = useMemo(() => members.slice(0, 4), [members]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfcf9]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading share page...</p>
        </div>
      </div>
    );
  }

  if (error || !group || !goal) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfcf9]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Goal not found'}</p>
          <button
            onClick={() => navigate(`/group/${groupId}/goals`)}
            className="text-primary hover:underline"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-slate-900">
      <nav className="max-w-5xl mx-auto px-6 pt-8 pb-24">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <button
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            onClick={() => navigate(`/group/${group.id}/goals`)}
          >
            Back
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-24">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-[0.2em]">
              Public Showcase
            </span>
            {quarter && (
              <>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{quarter}</span>
              </>
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-8 leading-tight">
            {goal.title || 'Untitled Goal'}
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-slate-500 leading-relaxed font-light">
              {goal.description || `Featured goal from ${group.name}.`}
            </p>
          </div>
        </header>

        <section className="mb-24">
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Project Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
              {visibleMembers.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-6 text-sm text-slate-500 text-center">
                  No members found.
                </div>
              ) : (
                visibleMembers.map((member) => (
                  <div key={member.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 text-lg font-bold">
                      {getInitials(member.user?.name)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate">{member.user?.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate uppercase tracking-wider">{member.role || 'Member'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="space-y-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Featured Strategic Pillar</h2>
          </div>
          <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-[#137fec]/10 text-[#137fec] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    AI Top Pick 
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-6">
                  {selectedIdea?.title || 'No selected top pick yet'}
                </h3>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                  {selectedIdea?.content || 'No idea content available for this goal yet.'}
                </p>
                <div className="rounded-2xl p-8 border border-slate-100 relative bg-gradient-to-br from-slate-50 to-slate-100">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-white shadow-sm rounded-lg flex items-center justify-center">
                    <span className="material-icons text-[#137fec] text-lg">auto_awesome</span>
                  </div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Selection Logic</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {`Rank: ${selectedIdea?.rank ? `#${selectedIdea.rank}` : 'Unavailable'}`}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {`Score: ${selectedIdea?.score !== null && selectedIdea?.score !== undefined ? `${selectedIdea.score}/100` : 'Unavailable'}`}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {`Model: ${selectedSetting?.model || 'Not set'}`}
                    </span>
                  </div>
                  <p className="text-slate-600 text-base leading-relaxed mt-4">
                    {selectedIdea?.review || 'No AI review available for this goal yet.'}
                  </p>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="aspect-[4/5] rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-100 via-slate-50 to-emerald-100 shadow-2xl p-6 flex flex-col justify-between">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Goal Snapshot</div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Group</p>
                    <p className="text-xl font-bold text-slate-900">{group.name}</p>
                  </div>
                  <div className="text-xs text-slate-600">
                    {otherIdeas.length > 0 ? `${otherIdeas.length} alternative ideas were considered in this setting.` : 'No alternative ideas in current setting.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
