import { useEffect, useState } from "react";
import { api } from '../service';
import type { MoodStats, RedemptionEligibility, RedemptionHistory } from '../service/types';

interface EmotionalPuzzleProps {
  stats?: MoodStats | null;
  quote?: string;
  userId?: string;
  redemptionEligibility?: RedemptionEligibility | null;
  redemptionHistory?: RedemptionHistory[];
  onGetReward?: () => void;
}

export default function EmotionalPuzzle({
    stats,
    redemptionEligibility,
    redemptionHistory,
    userId,
    quote = "Every step forward is progress. Keep going!",
    onGetReward
  }: EmotionalPuzzleProps) {


  // 加载 entries
  useEffect(() => {
    if (userId){
      fetchEntries();
    }
  }, [userId])

  const fetchEntries = async () => {
    try {
      const res = await api.moods.listWithoutRedeemed(userId!, 'positive')
      console.log("==== res=== >",res)
      // TODO
      // 完成 情绪显示
    } catch (err) {

    }
  };


  const handleGetReward = () => {
    if (onGetReward) {
      onGetReward();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Emotional Accumulation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete {redemptionEligibility?.positive.base} days of positive logs to unlock your reward.
          </p>
        </div>
        <div className={`px-3 py-1 text-xs font-bold rounded-full ${
          redemptionEligibility?.positive.canRedeem
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
        }`}>
          {redemptionEligibility?.positive.count}/{redemptionEligibility?.positive.base} {redemptionEligibility?.positive.canRedeem ? 'COMPLETE' : 'DAYS'}
        </div>
      </div>

      {/* Puzzle Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative min-h-[550px]">
        <div className="puzzle-container group relative">

          {/* Quote Overlay */}
          <div className="hidden absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
            <div className="max-w-md">
              <span className="material-icons text-primary mb-2 text-4xl">format_quote</span>
              <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white italic leading-tight">
                "{quote}"
              </p>
            </div>
          </div>

          {/* Reward Button */}
          <div className="hidden absolute bottom-10 left-0 right-0 flex justify-center z-20">
            <button
              onClick={handleGetReward}
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-black text-xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all flex items-center gap-3"
              disabled={!redemptionEligibility?.positive.canRedeem}
            >
              <span className="material-icons animate-bounce">card_giftcard</span>
              Get Reward
              <div className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
            </button>
          </div>

        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .puzzle-container {
          margin: 0 auto;
          background-color: transparent;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
