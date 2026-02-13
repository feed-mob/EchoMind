import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type Idea, type Group } from '../services/api';
import { TEST_USER_ID } from '../config/constants';
import SimpleMarkdownEditor from '../components/SimpleMarkdownEditor';

interface GroupDetail extends Group {}
interface IdeaDraft {
  title: string;
  description: string;
}

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ideaEditorMode, setIdeaEditorMode] = useState<'create' | 'edit' | null>(null);
  const [ideaDraft, setIdeaDraft] = useState<IdeaDraft>({ title: '', description: '' });
  const [ideaSearchText, setIdeaSearchText] = useState('');

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const [groupData, ideasData] = await Promise.all([
        api.groups.getById(groupId!),
        api.ideas.listByGroup(groupId!)
      ]);

      setGroup(groupData);
      setIdeas(ideasData);
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

  const handleCreateIdea = () => {
    setIdeaDraft({ title: '', description: '' });
    setIdeaEditorMode('create');
  };

  const handleEditIdea = (idea: Idea) => {
    setIdeaDraft({
      title: idea.title,
      description: idea.content || '',
    });
    setIdeaEditorMode('edit');
  };

  const handleIdeaSubmit = async () => {
    const data = ideaDraft;
    if (!data.title.trim()) return;

    try {
      if (ideaEditorMode === 'edit' && selectedIdea) {
        await api.ideas.update(selectedIdea.id, {
          title: data.title,
          content: data.description,
        });
      } else {
        await api.ideas.create(groupId!, {
          title: data.title,
          content: data.description,
          authorId: TEST_USER_ID,
        });
      }

      await fetchGroupData();
      setIdeaEditorMode(null);
    } catch (err) {
      console.error('Error saving idea:', err);
      alert('Failed to save idea. Please try again.');
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;

    try {
      await api.ideas.delete(ideaId);
      await fetchGroupData();
      if (selectedIdea?.id === ideaId) {
        setSelectedIdea(null);
      }
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert('Failed to delete idea. Please try again.');
    }
  };

  const getFallbackAvatar = (name?: string | null) => {
    const initial = (name || 'A')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
      .charAt(0) || 'A';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" fill="#dbeafe"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#137fec">${initial}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (!ideaSearchText.trim()) return true;
    const term = ideaSearchText.trim().toLowerCase();
    return (
      idea.title.toLowerCase().includes(term) ||
      (idea.content || '').toLowerCase().includes(term)
    );
  });

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
        <header className="h-16 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center bg-white/50 dark:bg-background-dark/50 backdrop-blur-md">
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
              <button className="px-4 h-full text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all">
                Ideas
              </button>
              <button
                onClick={() => navigate(`/group/${group.id}/goals`)}
                className="px-4 h-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Goals
              </button>
              <button
                onClick={() => navigate(`/group/${group.id}/ai-evaluate`)}
                className="px-4 h-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all inline-flex items-center gap-1"
              >
                <span className="material-icons text-base">auto_fix_high</span>
                AI Evaluate
              </button>
            </nav>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all"
                    placeholder="Search ideas..."
                    type="text"
                    value={ideaSearchText}
                    onChange={(event) => setIdeaSearchText(event.target.value)}
                  />
                </div>
                <button
                  onClick={handleCreateIdea}
                  className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition-all shrink-0"
                >
                  <span className="material-icons text-sm">add</span> New Idea
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {filteredIdeas.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="material-icons text-5xl mb-4">lightbulb_outline</span>
                <p>No ideas found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    onClick={() => {
                      setSelectedIdea(idea);
                      setIdeaEditorMode(null);
                    }}
                    className={`p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm cursor-pointer group transition-all ${
                      selectedIdea?.id === idea.id ? 'border-2 border-primary' : 'border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        alt="Author"
                        className="w-10 h-10 rounded-full"
                        src={idea.author?.avatar || getFallbackAvatar(idea.author?.name)}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className={`font-semibold ${selectedIdea?.id === idea.id ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}>
                            {idea.title}
                          </h3>
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
                            <span className="material-icons text-xs">person</span> {idea.author?.name || 'Anonymous'}
                          </span>
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
          </div>

          {ideaEditorMode ? (
            <aside className="flex-1 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark overflow-y-auto custom-scrollbar">
              <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold">{ideaEditorMode === 'edit' ? 'Edit Idea' : 'New Idea'}</h2>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    onClick={() => setIdeaEditorMode(null)}
                  >
                    {selectedIdea ? 'View Detail' : 'Cancel'}
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg"
                    onClick={() => void handleIdeaSubmit()}
                  >
                    Save Idea
                  </button>
                </div>
              </header>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Idea Title</label>
                  <input
                    className="w-full bg-transparent border-none text-3xl font-extrabold text-slate-900 dark:text-white focus:ring-0 p-0 placeholder-slate-700"
                    type="text"
                    placeholder="Untitled Idea"
                    value={ideaDraft.title}
                    onChange={(event) => setIdeaDraft((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <SimpleMarkdownEditor
                    value={ideaDraft.description}
                    rows={12}
                    onChange={(nextValue) => setIdeaDraft((prev) => ({ ...prev, description: nextValue }))}
                  />
                </div>
              </div>
            </aside>
          ) : selectedIdea ? (
            <aside className="flex-1 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark overflow-y-auto custom-scrollbar">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img
                      alt="Author"
                      className="w-10 h-10 rounded-full"
                      src={selectedIdea.author?.avatar || getFallbackAvatar(selectedIdea.author?.name)}
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedIdea.author?.name || 'Anonymous'}</h3>
                      <span className="text-[10px] text-slate-500">{new Date(selectedIdea.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditIdea(selectedIdea)}
                      className="icon-button text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      title="Edit idea"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteIdea(selectedIdea.id)}
                      className="icon-button text-slate-400 hover:text-red-500"
                      title="Delete idea"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{selectedIdea.title}</h2>

                {selectedIdea.content && (
                  <div className="mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {selectedIdea.content}
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
                      <button className="icon-button absolute bottom-3 right-3 text-primary">
                        <span className="material-icons">send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          ) : (
            <aside className="flex-1 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark overflow-y-auto custom-scrollbar flex items-center justify-center">
              <div className="text-center text-slate-400">
                <span className="material-icons text-6xl mb-4">lightbulb_outline</span>
                <p className="text-sm">Select an idea to view details</p>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
