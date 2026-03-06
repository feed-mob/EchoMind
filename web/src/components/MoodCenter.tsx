export default function MoodCenter() {
  return (
    <div className="group bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-lg relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
        <span className="material-icons text-8xl text-primary">sentiment_satisfied</span>
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-icons text-primary">auto_awesome</span>
          <h3 className="text-indigo-900 dark:text-indigo-200 font-extrabold text-xl">Mood Corner</h3>
        </div>
        <p className="text-indigo-800/80 dark:text-indigo-300/80 text-sm mb-6 leading-relaxed">
          Your Mood Corner: Shed troubles, store joy. Turn gray moments into space and bright ones into sweet rewards.
        </p>
        <div className="flex gap-4 mb-8">
          <div className="group/item flex-1 bg-white/60 dark:bg-slate-900/40 backdrop-blur p-3 rounded-xl border border-white dark:border-slate-700 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all">
            <div className="size-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
              <span className="material-icons text-3xl">restaurant</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">Candy Jar</span>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Store joy</p>
          </div>
          <div className="group/item flex-1 bg-white/60 dark:bg-slate-900/40 backdrop-blur p-3 rounded-xl border border-white dark:border-slate-700 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all">
            <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center text-slate-400">
              <span className="material-icons text-3xl">delete_outline</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Recycle</span>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Shed troubles</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">How are you today?</p>
          <div className="relative">
            <input
              className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary shadow-inner"
              placeholder="Record your mood..."
              type="text"
            />
            <button className="absolute right-2 top-1.5 size-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90">
              <span className="material-icons text-sm">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
