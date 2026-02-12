import { useState, useEffect } from 'react';
import CreateGroupModal from '../components/CreateGroupModal';

const API_URL = 'http://localhost:3001';

interface GroupData {
  id: string;
  name: string;
  department?: string | null;
  icon?: string | null;
  logo?: string | null;
  status: string;
  memberCount: number;
  ideaCount: number;
}

export default function Groups() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/groups`);
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (data: { name: string; logo?: File }) => {
    try {
      const response = await fetch(`${API_URL}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          icon: 'groups',
          status: 'active'
        })
      });

      if (!response.ok) throw new Error('Failed to create group');

      await fetchGroups();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };

  const getStatusText = (group: GroupData) => {
    if (group.ideaCount === 0) return 'No ideas yet';
    if (group.status === 'completed') return 'Evaluation Complete';
    if (group.status === 'processing') return 'AI Evaluation In Progress';
    return `${group.ideaCount} Ideas`;
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
            <h1 className="text-xl font-bold tracking-tight">WIDEA</h1>
            <div className="relative w-full max-w-md ml-8">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all"
                placeholder="Search groups..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-icons text-sm">add</span>
              Create New Group
            </button>
          </div>
        </header>

        {/* Grid Content */}
        <section className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="group relative bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-icons">{group.icon || 'groups'}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{group.name}</h3>
                      <span className="text-xs text-slate-400">{group.department || 'No department'}</span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <span className="material-icons">more_vert</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="material-icons text-[12px]">group</span> {group.memberCount} Members
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold ${
                    group.status === 'processing'
                      ? 'bg-primary/10 text-primary'
                      : group.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    <span className="material-icons text-[12px]">
                      {group.status === 'processing' ? 'auto_awesome' : group.status === 'completed' ? 'check_circle' : 'lightbulb'}
                    </span>
                    {getStatusText(group)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className={`text-[11px] font-medium ${
                    group.status === 'processing'
                      ? 'text-primary animate-pulse'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {group.status === 'processing' ? 'Processing ideas...' : `${group.ideaCount} ideas`}
                  </span>
                  <div className="flex -space-x-2">
                    {group.memberCount > 0 ? (
                      <div className="w-6 h-6 rounded-full border-2 border-white dark:border-card-dark bg-slate-200 dark:bg-slate-700 text-[8px] flex items-center justify-center font-bold">
                        {group.memberCount}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">No members</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Group Placeholder */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="group relative border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:border-primary/50 transition-all cursor-pointer min-h-[180px]"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <span className="material-icons">add_circle_outline</span>
              </div>
              <h3 className="font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">Start a new group</h3>
              <p className="text-xs text-slate-400 mt-1">Invite collaborators and AI assistants</p>
            </div>
          </div>
        </section>
      </main>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
}
