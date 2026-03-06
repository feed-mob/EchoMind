import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type Idea, type Group, type IdeaComment } from '../service';
import { useAuth } from '../auth/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import SimpleMarkdownEditor from '../components/SimpleMarkdownEditor';
import GroupTopNav from '../components/GroupTopNav';
import AnimatedLightbulb from '../components/AnimatedLightbulb';
import { useToast } from '../components/ToastProvider';

interface GroupDetail extends Group {}
interface IdeaDraft {
  title: string;
  description: string;
}

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ideaEditorMode, setIdeaEditorMode] = useState<'create' | 'edit' | null>(null);
  const [ideaDraft, setIdeaDraft] = useState<IdeaDraft>({ title: '', description: '' });
  const [ideaSearchText, setIdeaSearchText] = useState('');
  const [comments, setComments] = useState<IdeaComment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState('');
  const [commentActionId, setCommentActionId] = useState<string | null>(null);
  const [ideaActionId, setIdeaActionId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'idea' | 'comment'; id: string } | null>(null);

  useEffect(() => {
    if (groupId) {
      void fetchGroupData();
    }
  }, [groupId, user?.id]);

  useEffect(() => {
    if (!selectedIdea?.id) {
      setComments([]);
      setCommentDraft('');
      setEditingCommentId(null);
      setEditingCommentDraft('');
      return;
    }

    void fetchComments(selectedIdea.id);
  }, [selectedIdea?.id]);

  const fetchGroupData = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const groupData = await api.groups.getById(groupId);
      let canAccessGroup = Boolean(groupData.publicAccessEnabled);

      if (!canAccessGroup && user?.id) {
        const memberships = await api.users.listGroups(user.id);
        canAccessGroup = memberships.some((membership) => membership.groupId === groupId);
      }

      if (!canAccessGroup) {
        setGroup(null);
        setIdeas([]);
        setSelectedIdea(null);
        setError('You do not have access to this group.');
        toast.error('You do not have access to this group.');
        navigate('/group', { replace: true });
        return;
      }

      const ideasData = await api.ideas.listByGroup(groupId);

      setGroup(groupData);
      setIdeas(ideasData);
      setSelectedIdea((prev) => {
        if (!prev) return null;
        return ideasData.find((item) => item.id === prev.id) || null;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
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
        if (!user?.id) {
          return;
        }
        await api.ideas.create(groupId!, {
          title: data.title,
          content: data.description,
          authorId: user.id,
        });
      }

      await fetchGroupData();
      setIdeaEditorMode(null);
    } catch (err) {
      console.error('Error saving idea:', err);
      toast.error('Failed to save idea. Please try again.');
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      setIdeaActionId(ideaId);
      await api.ideas.delete(ideaId);
      await fetchGroupData();
      if (selectedIdea?.id === ideaId) {
        setSelectedIdea(null);
      }
    } catch (err) {
      console.error('Error deleting idea:', err);
      toast.error('Failed to delete idea. Please try again.');
    } finally {
      setIdeaActionId(null);
    }
  };

  const fetchComments = async (ideaId: string) => {
    try {
      setCommentsLoading(true);
      const data = await api.comments.listByIdea(ideaId);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    const content = commentDraft.trim();
    if (!selectedIdea?.id || !content) return;
    if (!user?.id) {
      return;
    }

    try {
      setCommentSubmitting(true);
      await api.comments.create(selectedIdea.id, {
        content,
        authorId: user.id,
      });
      setCommentDraft('');

      await Promise.all([
        fetchComments(selectedIdea.id),
        fetchGroupData(),
      ]);
    } catch (err) {
      console.error('Error creating comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleStartEditComment = (comment: IdeaComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentDraft(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentDraft('');
  };

  const handleSaveEditedComment = async (commentId: string) => {
    const content = editingCommentDraft.trim();
    if (!selectedIdea?.id || !content || !user?.id) return;

    try {
      setCommentActionId(commentId);
      await api.comments.update(commentId, {
        content,
        authorId: user.id,
      });
      await fetchComments(selectedIdea.id);
      handleCancelEditComment();
    } catch (err) {
      console.error('Error updating comment:', err);
      toast.error('Failed to update comment. Please try again.');
    } finally {
      setCommentActionId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedIdea?.id || !user?.id) return;

    try {
      setCommentActionId(commentId);
      await api.comments.delete(commentId, { authorId: user.id });
      if (editingCommentId === commentId) {
        handleCancelEditComment();
      }
      await Promise.all([
        fetchComments(selectedIdea.id),
        fetchGroupData(),
      ]);
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment. Please try again.');
    } finally {
      setCommentActionId(null);
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
  const hasIdeaPanel = Boolean(ideaEditorMode || selectedIdea);

  const closeIdeaPanel = () => {
    setIdeaEditorMode(null);
    setSelectedIdea(null);
  };

  const isDeleteConfirming =
    deleteTarget?.type === 'idea'
      ? ideaActionId === deleteTarget.id
      : deleteTarget?.type === 'comment'
      ? commentActionId === deleteTarget.id
      : false;

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'idea') {
      await handleDeleteIdea(deleteTarget.id);
    } else {
      await handleDeleteComment(deleteTarget.id);
    }
    setDeleteTarget(null);
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
        <GroupTopNav group={group} activeTab="ideas" />

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div
            className={`${hasIdeaPanel ? 'hidden lg:flex' : 'flex'} flex-1 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex-col overflow-hidden`}
          >
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
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {idea.content || 'No description provided.'}
                        </p>
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
            <aside className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark overflow-y-auto custom-scrollbar">
              <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    className="lg:hidden flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/40 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={closeIdeaPanel}
                  >
                    <span className="material-icons text-base">arrow_back</span>
                    Back
                  </button>
                  <h2 className="text-lg font-bold">{ideaEditorMode === 'edit' ? 'Edit Idea' : 'New Idea'}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="hidden lg:inline-flex px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
            <aside className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark overflow-y-auto custom-scrollbar">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      className="lg:hidden icon-button text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                      onClick={closeIdeaPanel}
                      title="Back to list"
                      aria-label="Back to list"
                    >
                      <span className="material-icons">arrow_back</span>
                    </button>
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
                      className="icon-button text-slate-400 hover:text-red-500 disabled:opacity-40"
                      title="Delete idea"
                      disabled={ideaActionId === selectedIdea.id}
                      onClick={() => setDeleteTarget({ type: 'idea', id: selectedIdea.id })}
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
                  {commentsLoading ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Loading comments...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No comments yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <img
                            alt="Author"
                            className="w-8 h-8 rounded-full"
                            src={comment.author?.avatar || getFallbackAvatar(comment.author?.name)}
                          />
                          <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {comment.author?.name || 'Anonymous'}
                              </span>
                              <div className="flex items-center gap-2">
                                {user?.id === comment.authorId && (
                                  <>
                                    <button
                                      className="icon-button text-slate-500 hover:text-primary disabled:opacity-40"
                                      onClick={() => handleStartEditComment(comment)}
                                      disabled={commentActionId === comment.id}
                                      title="Edit comment"
                                      aria-label="Edit comment"
                                    >
                                      <span className="material-icons text-sm">edit</span>
                                    </button>
                                    <button
                                      className="icon-button text-slate-500 hover:text-red-500 disabled:opacity-40"
                                      disabled={commentActionId === comment.id}
                                      onClick={() => setDeleteTarget({ type: 'comment', id: comment.id })}
                                      title="Delete comment"
                                      aria-label="Delete comment"
                                    >
                                      <span className="material-icons text-sm">delete</span>
                                    </button>
                                  </>
                                )}
                                <span className="text-[11px] text-slate-400">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            {editingCommentId === comment.id ? (
                              <div>
                                <textarea
                                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary resize-none min-h-[72px]"
                                  value={editingCommentDraft}
                                  onChange={(event) => setEditingCommentDraft(event.target.value)}
                                />
                                <div className="mt-2 flex items-center justify-end gap-2">
                                  <button
                                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                                    onClick={handleCancelEditComment}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="px-2 py-1 text-xs font-semibold text-white bg-primary rounded-md disabled:opacity-40"
                                    onClick={() => void handleSaveEditedComment(comment.id)}
                                    disabled={commentActionId === comment.id || !editingCommentDraft.trim()}
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex gap-3">
                    <img
                      alt="Me"
                      className="w-8 h-8 rounded-full shrink-0"
                      src={user?.avatar || getFallbackAvatar(user?.name)}
                    />
                    <div className="flex-1 relative">
                      <textarea
                        className="w-full p-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-1 focus:ring-primary focus:border-primary resize-none min-h-[80px]"
                        placeholder="Add a comment..."
                        value={commentDraft}
                        onChange={(event) => setCommentDraft(event.target.value)}
                      />
                      <button
                        className="icon-button absolute bottom-3 right-3 text-primary disabled:opacity-40"
                        onClick={() => void handleSubmitComment()}
                        disabled={commentSubmitting || !commentDraft.trim()}
                        title="Send comment"
                      >
                        <span className="material-icons">send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          ) : (
            <aside className="hidden lg:flex flex-1 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark overflow-y-auto custom-scrollbar items-center justify-center">
              <div className="text-center text-slate-400">
                <AnimatedLightbulb size={120} />
                <p className="text-m">Jump into an idea, or create your next big one.</p>
              </div>
            </aside>
          )}
        </div>
      </main>
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Confirmation"
        message={deleteTarget?.type === 'idea' ? 'Are you sure you want to delete this idea?' : 'Are you sure you want to delete this comment?'}
        confirmText="Delete"
        confirmTone="danger"
        confirmLoading={isDeleteConfirming}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
