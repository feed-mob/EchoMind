interface CreateGroupCardProps {
  onClick?: () => void;
}

export default function CreateGroupCard({ onClick }: CreateGroupCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-dashed border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:border-primary/50 transition-all cursor-pointer min-h-[180px]"
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-all">
        <span className="material-icons">add_circle_outline</span>
      </div>
      <h3 className="font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
        Start a new group
      </h3>
      <p className="text-xs text-slate-400 mt-1">Invite collaborators and AI assistants</p>
    </div>
  );
}
