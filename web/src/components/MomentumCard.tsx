interface MomentumCardProps {
  streakDays: number;
  moodStatus?: 'great' | 'good' | 'neutral' | 'low';
}

export default function MomentumCard({
  streakDays,
  moodStatus = 'great'
}: MomentumCardProps) {
  const moodLabels: Record<string, { text: string; colorClass: string }> = {
    great: { text: 'great', colorClass: 'text-orange-500' },
    good: { text: 'good', colorClass: 'text-emerald-500' },
    neutral: { text: 'okay', colorClass: 'text-primary' },
    low: { text: 'low', colorClass: 'text-slate-500' }
  };

  const mood = moodLabels[moodStatus] || moodLabels.great;

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-icons text-orange-500 text-4xl">celebration</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Incredible Momentum!</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
          You've been feeling <span className={`${mood.colorClass} font-bold`}>{mood.text}</span> for {streakDays} days straight! Your consistency is helping you build a deeper understanding of your well-being.
        </p>
      </div>
      <div className="absolute -right-8 -bottom-8 opacity-5 text-slate-900 dark:text-white">
        <span className="material-icons text-[180px]">show_chart</span>
      </div>
    </div>
  );
}
