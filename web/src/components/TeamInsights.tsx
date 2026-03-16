import type { TeamInsights } from '../service/types';

interface TeamInsightsProps {
  insights: TeamInsights | null;
}

export default function TeamInsightsCard({ insights }: TeamInsightsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#1754cf]/10 rounded-lg text-[#1754cf]">
          <span className="material-icons">lightbulb</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Team Insights</h3>
      </div>
      <div className="space-y-3">
        {insights?.positiveTrends && insights.positiveTrends.length > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
            <div className="flex items-start gap-2">
              <span className="material-icons text-green-500 text-sm mt-0.5">check_circle</span>
              <p className="text-sm text-green-800 dark:text-green-200">{insights.positiveTrends[0]}</p>
            </div>
          </div>
        )}
        {insights?.areasForImprovement && insights.areasForImprovement.length > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <span className="material-icons text-yellow-500 text-sm mt-0.5">warning</span>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{insights.areasForImprovement[0]}</p>
            </div>
          </div>
        )}
        {insights?.recommendations && insights.recommendations.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <span className="material-icons text-blue-500 text-sm mt-0.5">tips_and_updates</span>
              <p className="text-sm text-blue-800 dark:text-blue-200">{insights.recommendations[0]}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
