import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateGroupModal from '../components/CreateGroupModal';
import ConfirmModal from '../components/ConfirmModal';
import MoodCenter from '../components/MoodCenter';
import NewSources from '../components/NewSources';
import { useToast } from '../components/ToastProvider';
import { api, type Group } from '../service';
import { useAuth } from '../auth/AuthContext';

export default function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuGroupId, setOpenMenuGroupId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [pendingDeleteGroup, setPendingDeleteGroup] = useState<Group | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [user?.id]);

  useEffect(() => {
    const handleDocumentClick = () => setOpenMenuGroupId(null);
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const [allGroups, memberships] = await Promise.all([
        api.groups.list(),
        user?.id ? api.users.listGroups(user.id) : Promise.resolve([]),
      ]);

      setGroups(allGroups);
      setMyGroupIds(memberships.map((membership) => membership.groupId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (data: { name: string; logo?: File }) => {
    if (!user?.id) {
      return;
    }

    try {
      const createdGroup = await api.groups.create({
        name: data.name,
        icon: 'groups',
        creatorUserId: user.id,
      });

      setIsModalOpen(false);
      navigate(`/group/${createdGroup.id}`);
    } catch (err) {
      console.error('Error creating group:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create group. Please try again.');
    }
  };

  const getStatusText = (group: Group) => {
    if (group.ideaCount === 0) return 'No ideas yet';
    if (group.status === 'completed') return 'Evaluation Complete';
    if (group.status === 'processing') return 'AI Evaluation In Progress';
    return `${group.ideaCount} Ideas`;
  };

  const getGroupBadge = (group: Group) => {
    if (group.status === 'completed') return 'Completed';
    if (group.status === 'processing') return 'Processing';
    return 'Active';
  };

  const getGroupCover = (groupId: string) => {
    const palette = [
      'from-blue-500 to-indigo-600',
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-indigo-600',
      'from-fuchsia-500 to-purple-600',
    ];
    const seed = groupId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return palette[seed % palette.length];
  };

  const myGroupIdSet = new Set(myGroupIds);
  const myGroups = groups.filter((group) => myGroupIdSet.has(group.id));
  const publicGroups = groups.filter(
    (group) => group.publicAccessEnabled && !myGroupIdSet.has(group.id),
  );

  const renderMyGroupCard = (group: Group, canManage: boolean) => (
    <div
      key={group.id}
      onClick={() => navigate(`/group/${group.id}`)}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className={`aspect-video relative overflow-hidden bg-gradient-to-br ${getGroupCover(group.id)}`}>
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute left-4 bottom-3 flex items-center gap-2 text-white">
          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="material-icons text-lg">{group.icon || 'groups'}</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide">{group.memberCount} Members</span>
        </div>
        <span className="absolute right-3 top-3 bg-white/95 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
          {getGroupBadge(group)}
        </span>
        {canManage && (
          <button
            className="absolute left-3 top-3 text-white/80 hover:text-white transition-colors icon-button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuGroupId((prev) => (prev === group.id ? null : group.id));
            }}
          >
            <span className="material-icons">more_vert</span>
          </button>
        )}
        {canManage && openMenuGroupId === group.id && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 left-3 z-20 w-36 rounded-lg border border-slate-200 bg-white shadow-xl py-1"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(group);
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPendingDeleteGroup(group);
                setOpenMenuGroupId(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{group.name}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {group.memberCount} members • {group.ideaCount} ideas
        </p>
        <p className={`text-xs mt-2 font-medium ${group.status === 'processing' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
          {getStatusText(group)}
        </p>
      </div>
    </div>
  );

  const renderPublicGroupCard = (group: Group) => (
    <div
      key={group.id}
      className="flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm"
    >
      <div className={`aspect-video relative overflow-hidden bg-gradient-to-br ${getGroupCover(group.id)}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute left-3 top-3 w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
          <span className="material-icons text-lg">{group.icon || 'groups'}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{group.name}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {group.memberCount} members • {group.ideaCount} ideas
        </p>
        <button
          onClick={() => navigate(`/group/${group.id}`)}
          className="mt-2 w-full py-2 bg-primary/10 text-primary font-bold rounded-lg text-sm hover:bg-primary hover:text-white transition-colors"
        >
          Join Group
        </button>
      </div>
    </div>
  );

  const handleOpenEdit = (group: Group) => {
    setEditingGroup(group);
    setOpenMenuGroupId(null);
  };

  const handleEditGroup = async (data: { name: string; logo?: File }) => {
    if (!editingGroup || !data.name.trim()) return;

    try {
      await api.groups.update(editingGroup.id, { name: data.name.trim() });
      await fetchGroups();
      setEditingGroup(null);
    } catch (err) {
      console.error('Error updating group:', err);
      toast.error('Failed to update group. Please try again.');
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    setOpenMenuGroupId(null);

    try {
      setDeletingGroupId(group.id);
      await api.groups.delete(group.id);
      await fetchGroups();
    } catch (err) {
      console.error('Error deleting group:', err);
      toast.error('Failed to delete group. Please try again.');
    } finally {
      setDeletingGroupId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <span className="material-icons text-red-500 text-5xl mb-4">error_outline</span>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchGroups}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-bold tracking-tight">EchoMind</h1>
            <div className="relative w-full max-w-md ml-8">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all"
                placeholder="Search groups..."
                type="text"
              />
            </div>
          </div>
        </header>

        {/* Grid Content */}
        <section className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-8">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">My Groups</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                  {myGroups.map((group) => renderMyGroupCard(group, true))}

                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="aspect-video w-full flex flex-col items-center justify-center gap-3 p-4">
                      <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-icons text-xl">add</span>
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Start a new group</h3>
                        <p className="text-[10px] text-slate-500">Collaborate and share ideas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Public Groups</h2>
                </div>
                {publicGroups.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">No public groups available.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {publicGroups.map((group) => renderPublicGroupCard(group))}
                  </div>
                )}
              </section>
            </div>

            <aside className="w-full lg:w-80 flex flex-col gap-6">
              <MoodCenter />
              <NewSources />
            </aside>
          </div>
        </section>
      </main>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
      <CreateGroupModal
        isOpen={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        onSubmit={handleEditGroup}
        mode="edit"
        initialName={editingGroup?.name || ''}
      />
      <ConfirmModal
        isOpen={!!pendingDeleteGroup}
        title="Delete Confirmation"
        message={pendingDeleteGroup ? `Delete group "${pendingDeleteGroup.name}"?` : ''}
        confirmText="Delete"
        confirmTone="danger"
        confirmLoading={pendingDeleteGroup ? deletingGroupId === pendingDeleteGroup.id : false}
        onClose={() => setPendingDeleteGroup(null)}
        onConfirm={async () => {
          if (!pendingDeleteGroup) return;
          await handleDeleteGroup(pendingDeleteGroup);
          setPendingDeleteGroup(null);
        }}
      />
    </div>
  );
}
