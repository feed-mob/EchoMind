import { useState } from 'react';
import CreateGroupModal from '../components/CreateGroupModal';

export default function Groups() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Marketing Q4 Strategy",
      department: "Marketing Department",
      icon: "campaign",
      members: 8,
      ideas: 24,
      status: "active",
      statusText: "3 New Ideas",
      avatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ"
      ]
    },
    {
      id: 2,
      name: "Product Roadmap 2024",
      department: "Product Team",
      icon: "rocket_launch",
      members: 12,
      ideas: 45,
      status: "completed",
      statusText: "Evaluation Complete",
      avatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ"
      ]
    },
    {
      id: 3,
      name: "Office Redesign Ideas",
      department: "Operations",
      icon: "apartment",
      members: 5,
      ideas: 18,
      status: "active",
      statusText: "5 New Ideas",
      avatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ"
      ]
    },
    {
      id: 4,
      name: "Customer Feedback Analysis",
      department: "Customer Success",
      icon: "feedback",
      members: 6,
      ideas: 32,
      status: "processing",
      statusText: "AI Evaluation In Progress",
      avatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ"
      ]
    }
  ]);

  const handleCreateGroup = (data: { name: string; logo?: File }) => {
    const newGroup = {
      id: groups.length + 1,
      name: data.name,
      department: "New Department",
      icon: "groups",
      members: 1,
      ideas: 0,
      status: "active" as const,
      statusText: "Just created",
      avatars: []
    };
    setGroups([...groups, newGroup]);
    setIsModalOpen(false);
  };

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
                      <span className="material-icons">{group.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{group.name}</h3>
                      <span className="text-xs text-slate-400">{group.department}</span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <span className="material-icons">more_vert</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="material-icons text-[12px]">group</span> {group.members} Members
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
                    {group.statusText}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className={`text-[11px] font-medium ${
                    group.status === 'processing'
                      ? 'text-primary animate-pulse'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {group.status === 'processing' ? 'Processing ideas...' : `${group.ideas} ideas`}
                  </span>
                  <div className="flex -space-x-2">
                    {group.avatars.map((avatar, idx) => (
                      <img
                        key={idx}
                        alt={`Member ${idx + 1}`}
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-card-dark"
                        src={avatar}
                      />
                    ))}
                    {group.members > group.avatars.length && (
                      <div className="w-6 h-6 rounded-full border-2 border-white dark:border-card-dark bg-slate-200 dark:bg-slate-700 text-[8px] flex items-center justify-center font-bold">
                        +{group.members - group.avatars.length}
                      </div>
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
