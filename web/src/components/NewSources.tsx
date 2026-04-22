export default function NewSources() {
  return (<></>)
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h4 className="font-bold mb-4 flex items-center gap-2">
        <span className="material-icons text-primary text-lg">trending_up</span>
        New Sources
      </h4>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="size-8 rounded-full bg-indigo-100 dark:bg-slate-800 flex-shrink-0"></div>
          <div>
            <p className="text-xs font-medium"><span className="font-bold">Leo</span> added a new idea in <span className="text-primary">TINCA</span></p>
            <p className="text-[10px] text-slate-400 mt-0.5">2 hours ago</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="size-8 rounded-full bg-emerald-100 dark:bg-slate-800 flex-shrink-0"></div>
          <div>
            <p className="text-xs font-medium"><span className="font-bold">Sarah</span> joined <span className="text-primary">Innovation Hub</span></p>
            <p className="text-[10px] text-slate-400 mt-0.5">5 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
