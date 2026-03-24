interface MomentumCardProps {
  checkInDays: number;
  moodStatus?: 'positive' | 'negative' | 'neutral';
}

export default function MomentumCard({
  checkInDays,
  moodStatus = 'positive'
}: MomentumCardProps) {
  // Negative mood: supportive card


  // Positive and neutral mood: momentum card
  const moodLabels: Record<string, { text: string; colorClass: string }> = {
    positive: { text: 'great', colorClass: 'text-orange-500' },
    neutral: { text: 'okay', colorClass: 'text-primary' }
  };

  const mood = moodLabels[moodStatus] || moodLabels.positive;

  if (moodStatus === 'negative') {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-icons text-primary text-4xl">favorite</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">It's Okay to Feel This Way</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Some days are heavier than others. Take a deep breath—you are doing enough. You don't have to carry it all today.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-5 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-[180px]">self_improvement</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-icons text-orange-500 text-4xl">celebration</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Incredible Momentum!</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
          You've been feeling <span className={`${mood.colorClass} font-bold`}>{mood.text}</span> for {checkInDays} days straight! Your consistency is helping you build a deeper understanding of your well-being.
        </p>
      </div>
      <div className="absolute -right-8 -bottom-8 opacity-5 text-slate-900 dark:text-white">
        <span className="material-icons text-[180px]">show_chart</span>
      </div>
    </div>
  );
}
