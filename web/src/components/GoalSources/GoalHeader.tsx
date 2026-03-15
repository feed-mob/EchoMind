interface GoalHeaderProps {
  title: string;
  description: string;
  backgroundImage?: string;
  className?: string;
  onEdit: () => void;
}

export default function GoalHeader({
  title,
  description,
  backgroundImage,
  className,
  onEdit,
}: GoalHeaderProps) {
  return (
    <div
      className={`relative h-64 flex-shrink-0 flex items-end px-8 pb-8 bg-cover bg-center ${className || ''}`}
      style={backgroundImage ? { backgroundImage: `url('${backgroundImage}')` } : undefined}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/40 dark:via-background-dark/40 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 w-full flex justify-between items-end">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white mb-3">
            ACTIVE GOAL
          </span>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-slate-700 dark:text-slate-300 text-lg font-medium max-w-xl">
            {description}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-2.5 rounded-lg font-bold shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit Goal
        </button>
      </div>
    </div>
  );
}
