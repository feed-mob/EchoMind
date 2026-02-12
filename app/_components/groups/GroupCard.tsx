import { Group } from '@/app/_types/group';

interface GroupCardProps {
  group: Group;
  onClick?: () => void;
}

export default function GroupCard({ group, onClick }: GroupCardProps) {
  const getStatusColor = () => {
    switch (group.status) {
      case 'evaluating':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-icons">{group.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{group.title}</h3>
            <span className="text-xs text-slate-400">{group.department}</span>
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
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold ${getStatusColor()}`}>
          <span className="material-icons text-[12px]">auto_awesome</span> {group.statusText}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className={`text-[11px] font-medium ${group.status === 'evaluating' ? 'text-primary animate-pulse' : 'text-slate-500'}`}>
          {group.lastActivity || `${group.ideaCount} ideas collected`}
        </span>
        <div className="flex -space-x-2">
          {group.members.slice(0, 3).map((member) => (
            <img
              key={member.id}
              alt={member.name}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-card-dark"
              src={member.avatar}
            />
          ))}
          {group.memberCount > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-card-dark bg-slate-200 dark:bg-slate-700 text-[8px] flex items-center justify-center font-bold">
              +{group.memberCount - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
