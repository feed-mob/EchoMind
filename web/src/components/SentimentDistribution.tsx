import type { TeamMoodDistribution } from '../service/types';

interface SentimentDistributionProps {
  distribution: TeamMoodDistribution[];
}

const emotionLabels: Record<string, string> = {
  joyful: 'Joyful',
  calm: 'Calm',
  anxious: 'Anxious',
  stressed: 'Stressed',
  excited: 'Excited',
  tired: 'Tired',
  grateful: 'Grateful',
  frustrated: 'Frustrated',
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
  productive: 'Productive',
};

const pieColors = ['#22C55E', '#EAB308', '#DC2626', '#F97316', '#1E40AF', '#EC4899', '#9CA3AF', '#6B7280'];

export default function SentimentDistribution({ distribution }: SentimentDistributionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sentiment Distribution</h3>
      <div className="flex items-center gap-8">
        {/* 简化的环形图 */}
        <div className="relative h-40 w-40 rounded-full border-[16px] border-slate-100 dark:border-slate-800 flex items-center justify-center">
          {distribution.length > 0 && (
            <>
              <div
                className="absolute inset-0 rounded-full border-[16px] border-green-500 border-l-transparent border-b-transparent rotate-45"
                style={{
                  clipPath: `polygon(50% 0%, 100% 0%, 100% ${Math.min(100, distribution[0]?.percentage || 0)}%, 50% 50%)`,
                }}
              />
              <div
                className="absolute inset-0 rounded-full border-[16px] border-yellow-400 border-r-transparent border-t-transparent border-b-transparent -rotate-12"
                style={{
                  clipPath: `polygon(0% 0%, 50% 0%, 50% 50%, 0% ${Math.min(100, distribution[1]?.percentage || 0)}%)`,
                }}
              />
            </>
          )}
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {distribution.length > 0 ? `${distribution[0]?.percentage || 0}%` : '0%'}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-400">Positive</p>
          </div>
        </div>
        {/* 图例 */}
        <div className="flex flex-col gap-3">
          {distribution.slice(0, 4).map((item, index) => (
            <div key={item.emotion} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: pieColors[index % pieColors.length] }}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {emotionLabels[item.emotion] || item.emotion} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
