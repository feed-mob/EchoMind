export default function StorageUsageCard() {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-primary">
        <span className="material-icons text-base">info</span>
        <span className="text-xs font-semibold uppercase tracking-wider">Storage Usage</span>
      </div>
      <div className="mb-2 h-1.5 w-full rounded-full bg-primary/20">
        <div className="h-1.5 w-[0%] rounded-full bg-primary"></div>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">0 of 10 GB used</p>
    </div>
  );
}
