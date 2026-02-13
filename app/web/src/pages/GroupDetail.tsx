import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

interface Idea {
  id: string;
  title: string;
  description?: string;
  status: string;
  authorName?: string;
  authorAvatar?: string;
  tags?: string[];
  commentCount?: number;
  createdAt: string;
}

interface GroupDetail {
  id: string;
  name: string;
  department?: string | null;
  icon?: string | null;
  status: string;
  memberCount: number;
  ideaCount: number;
}

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const [groupRes, ideasRes] = await Promise.all([
        fetch(`${API_URL}/api/groups/${groupId}`),
        fetch(`${API_URL}/api/groups/${groupId}/ideas`)
      ]);

      if (!groupRes.ok) throw new Error('Failed to fetch group');

      const groupData = await groupRes.json();
      const ideasData = ideasRes.ok ? await ideasRes.json() : [];

      setGroup(groupData);
      setIdeas(ideasData);
      if (ideasData.length > 0) {
        setSelectedIdea(ideasData[0]);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_review': return 'bg-green-500/10 text-green-500';
      case 'approved': return 'bg-blue-500/10 text-blue-500';
      case 'rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_review': return 'In Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Draft';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading group...</p>
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
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-background-dark">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <button
              onClick={() => navigate('/group')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <div className="relative flex-1">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all"
                placeholder="Search ideas..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all">
              <span className="material-icons text-sm">add</span> New Idea
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">{group.name}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Sort by:</span>
                <button className="text-primary font-medium flex items-center">
                  Recent <span className="material-icons text-xs">arrow_drop_down</span>
                </button>
              </div>
            </div>

            {ideas.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="material-icons text-5xl mb-4">lightbulb_outline</span>
                <p>No ideas yet. Create your first idea!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className={`p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm cursor-pointer group transition-all ${
                      selectedIdea?.id === idea.id ? 'border-2 border-primary' : 'border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        alt="Author"
                        className="w-10 h-10 rounded-full"
                        src={idea.authorAvatar || 'https://via.placeholder.com/40'}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className={`font-semibold ${selectedIdea?.id === idea.id ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}>
                            {idea.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded tracking-wider ${getStatusColor(idea.status)}`}>
                            {getStatusText(idea.status)}
                          </span>
                        </div>
                        {idea.tags && idea.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {idea.tags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 uppercase">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-xs">comment</span> {idea.commentCount || 0}
                          </span>
                          <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedIdea && (
            <aside className="w-[400px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark overflow-y-auto custom-scrollbar">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img
                      alt="Author"
                      className="w-10 h-10 rounded-full"
                      src={selectedIdea.authorAvatar || 'https://via.placeholder.com/40'}
                    />
                    <div>
                      <h3 className="font-bold text-sm">{selectedIdea.authorName || 'Anonymous'}</h3>
                      <span className="text-[10px] text-slate-500">{new Date(selectedIdea.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <span className="material-icons">more_vert</span>
                  </button>
                </div>

                <h2 className="text-lg font-bold mb-4">{selectedIdea.title}</h2>

                {selectedIdea.description && (
                  <div className="mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedIdea.description}
                    </p>
                  </div>
                )}

                {selectedIdea.tags && selectedIdea.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedIdea.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                  <h3 className="text-sm font-bold mb-4">Comments ({selectedIdea.commentCount || 0})</h3>
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No comments yet
                  </div>
                  <div className="mt-6 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                      ME
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        className="w-full p-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary resize-none min-h-[80px]"
                        placeholder="Add a comment..."
                      />
                      <button className="absolute bottom-3 right-3 text-primary">
                        <span className="material-icons">send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
