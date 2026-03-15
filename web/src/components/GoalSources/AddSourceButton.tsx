interface AddSourceButtonProps {
  onClick: () => void;
}

export default function AddSourceButton({ onClick }: AddSourceButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-center gap-3 text-center group cursor-pointer hover:border-primary/50 transition-colors"
    >
      <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
        <span className="material-symbols-outlined text-base">add</span>
      </div>
      <p className="text-sm font-bold text-slate-400 group-hover:text-primary">Add New Source</p>
    </button>
  );
}
