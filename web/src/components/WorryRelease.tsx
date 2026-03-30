import { useEffect, useState } from 'react';
import { api } from '../service';
import type { RedemptionEligibility, RedemptionHistory } from '../service/types';


function getRandomIntInclusive(min:number, max:number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // 包含最小值和最大值
}

function generateRotation(i:number){
  const random = (i % 2 == 0) ? getRandomIntInclusive(-5, -12) : getRandomIntInclusive(5, 12);
  return random;
}

function generateWorryItems(obj: Record<string, number>): WorryItem[] {
  const result: WorryItem[] = [];
  const moods = Object.keys(obj);
  moods.forEach((m, index) => {
    const rotation = generateRotation(index);
    const item: WorryItem = {
      text: m,
      rotation: rotation,
    };
    result.push(item);
  });

  return result;
}
interface WorryItem {
  text: string;
  rotation: number;
}
interface WorryReleaseProps {
  completedDays?: number;
  totalDays?: number;
  stats?: any;
  userId?: string;
  onDumpSuccess?: () => void;
}

export default function WorryRelease({
    completedDays = 0,
    totalDays = 0,
    stats={},
    userId,
    onDumpSuccess
  }: WorryReleaseProps) {
  const isComplete = completedDays >= totalDays;
  const [isReleasing, setIsReleasing] = useState(false); // 用于 释放(倾倒) 情绪的 loading 状态
  const [isReleased, setIsReleased] = useState(false);
  const [worryItems, setWorryItems] = useState<WorryItem[]>([]);
  const [redemptionEligibility, setRedemptionEligibility] = useState<RedemptionEligibility | null>(null);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 用于获取数据的loading状态
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stats?.moodCounts) {
      const items = generateWorryItems(stats.moodCounts);
      setWorryItems(items);
    }
  }, [stats])

  useEffect(() => {
    if (userId) {
      fetchRedemptionData();
    }
  }, [userId])

  const fetchRedemptionData = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const [eligibility, history] = await Promise.all([
        api.moods.getRedemptionEligibility(userId),
        api.moods.getRedemptionHistory(userId, 5) // 只获取最近5条记录
      ]);
      setRedemptionEligibility(eligibility);
      setRedemptionHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch redemption data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!userId || !redemptionEligibility?.negative.canRedeem) {
      setError('You need at least 7 negative mood days to release your worries');
      return;
    }

    setIsReleasing(true);
    setError(null);

    try {
      const result = await api.moods.dumpMoods(userId);

      // 兑换成功
      setIsReleasing(false);
      setIsReleased(true);

      // 刷新数据
      await fetchRedemptionData();

      // 调用成功回调
      if (onDumpSuccess) {
        onDumpSuccess();
      }
    } catch (err) {
      setIsReleasing(false);
      setError(err instanceof Error ? err.message : 'Failed to release worries');
    }
  };

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Release Your Worries</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Feeling overwhelmed? Let&apos;s clear some mental space.</p>
        </div>
        <div className={`px-3 py-1 text-xs font-bold rounded-full ${
          isComplete
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
            : 'bg-slate-200 dark:bg-blue-900/30 text-slate-500'
        }`}>
          {completedDays}/{totalDays} {isComplete ? 'COMPLETE' : 'DAYS'}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative min-h-[600px]">
        {/* Bulging Trash Bin Visual */}
        <div className="group relative h-full">

          {/* Quote Overlay */}
          {isLoading ? (
            <div className="flex items-center justify-center px-6 pt-20 pb-28 text-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-slate-500 dark:text-slate-400">Loading...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center px-6 pt-20 pb-28 text-center">
              <div className="max-w-md">
                <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error_outline</span>
                <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                <button
                  onClick={fetchRedemptionData}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center px-6 pt-20 pb-28 text-center">
              {!isReleased ? <div className="max-w-md">
                <p className="text-xl font-medium text-slate-500 dark:text-slate-400 leading-tight">
                  &ldquo;Letting go isn&apos;t giving up, it&apos;s making room for better things.&rdquo;
                </p>
                {redemptionEligibility && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {redemptionEligibility.negative.canRedeem
                        ? `You have ${redemptionEligibility.negative.count} negative mood days. Click to release them!`
                        : `You need ${redemptionEligibility.negative.nextLevelNeed} more negative mood days to release your worries.`
                      }
                    </p>
                  </div>
                )}
              </div> : <div className="max-w-md">
                <span className="material-symbols-outlined text-6xl text-primary mb-4">check_circle</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Worries Released</p>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-tight">
                  Take a deep breath. You&apos;ve taken the first step toward a lighter mind.
                </p>
                {redemptionHistory.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your release has been recorded. Keep tracking your mood!
                    </p>
                  </div>
                )}
              </div>}
            </div>
          )}



          <div className="bin-container">
            <div className={`relative bin-container-wrapper ${isReleasing ? 'lid-tilt' : ''}`}>
              {/* Detailed Premium Lid */}
              <div className={`bin-lid flex flex-col items-center z-20 ${isReleasing ? 'lid-open' : ''}`}>
                <div className="bin-lid-handle"></div>
                <div className="bin-lid-top"></div>
              </div>

              {/* Trash Bin Body */}
              <div className={`trash-bin ${isReleasing ? 'releasing' : ''}`}>
                {/* 5 Vertical Panels */}
                <div className="bin-panel"></div>
                <div className="bin-panel"></div>
                <div className="bin-panel"></div>
                <div className="bin-panel"></div>
                <div className="bin-panel"></div>

                {/* Worries Inside (80% transparent via CSS) */}
                {!isReleased && <div className="bin-contents">
                  {worryItems.map((item, index) => (
                    <div
                      key={index}
                      className={`worry-wrapper ${isReleasing ? 'worry-throw' : ''}`}
                      style={{
                        '--throw-delay': `${index * 0.12 + 1}s`,
                        '--item-index': index,
                      } as React.CSSProperties}
                    >
                      <span
                        className={`worry-item ${isReleasing ? 'worry-land' : ''}`}
                        style={{
                          transform: `rotate(${item.rotation}deg)`,
                        }}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>}

              </div>
            </div>
          </div>

          {/* Release Button */}
          <div className="flex justify-center px-6 pt-28 pb-20">
            <button
              onClick={handleRelease}
              disabled={isReleasing || isReleased || !isComplete || !redemptionEligibility?.negative.canRedeem}
              className="group relative px-10 py-5 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-black text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="material-symbols-outlined">delete_sweep</span>
              Release Your Worries
              <div className="absolute inset-0 rounded-xl bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500" />
            </button>
          </div>

          {/* Redemption History */}
          {!isLoading && !error && redemptionHistory.length > 0 && (
            <div className="px-6 pb-8">
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Recent Releases</h3>
                <div className="space-y-2">
                  {redemptionHistory.map((record, index) => (
                    <div key={record.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          Level {record.level} Release
                        </span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CSS for the trash bin animation */}
      <style>{`
        .bin-container {
          position: relative;
          width: 200px;
          margin: 0 auto;
          background-color: transparent;
          overflow: visible;
        }

        .trash-bin {
          position: relative;
          width: 200px;
          height: 260px;
          background: #cbd5e1;
          border-radius: 4px 4px 40px 40px;
          box-shadow: inset -10px -10px 20px rgba(0,0,0,0.05), 0 10px 25px -5px rgba(0,0,0,0.1);
          z-index: 10;
          display: flex;
          justify-content: space-evenly;
          padding: 20px 10px 0;
          overflow: hidden;
        }

        .trash-bin.releasing{
          overflow: visible;
        }

        .bin-panel {
          width: 15%;
          height: 80%;
          margin-top: auto;
          margin-bottom: auto;
          background: rgba(0,0,0,0.05);
          border-radius: 2px;
        }

        .bin-contents {
          position: absolute;
          bottom: 5px;
          left: 0;
          right: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          padding: 10px;
          gap: 4px;
          z-index: 11;
          opacity: 0.4;
        }
        .bin-contents.opacity-0 {
          opacity: 0;
        }

        /* Premium Lid Design */
        .bin-lid {
          position: absolute;
          top: -15px;
          left: -15px;
          right: -15px;
        }
        .bin-lid-top {
          height: 20px;
          width: 100%;
          background: #94a3b8;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          z-index: 15;
        }

        .bin-lid-handle {
          width: 60px;
          height: 12px;
          background: #64748b;
          border-radius: 6px 6px 0 0;
          z-index: 14;
        }

        .bin-container-wrapper.lid-tilt {
          animation: tilt 1.2s ease-in-out 0.3s forwards;
        }

        @keyframes tilt {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(60deg);
          }
        }

        .bin-container-wrapper:hover .bin-lid:not(.lid-open){
          animation: shake 0.6s ease-in-out;
        }

        /* Lid opening animation - pivot from left edge */
        .bin-lid.lid-open {
          animation: lidOpen 0.5s ease-out forwards;
          transform-origin: left center;
        }

        @keyframes lidOpen {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-65deg);
          }
        }

        .worry-wrapper {
          transition: transform 0.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-child(n) {
          animation: jampp-4 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(1) {
          animation: jampp 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(2) {
          animation: jampp-1 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(3) {
          animation: jampp-2 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(4) {
          animation: jampp-3 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(5) {
          animation: jampp-3 1.2s ease-in-out;
        }


        .worry-item {
          display: inline-block;
          font-size: 14px;
          font-weight: 800;
          color: #314158;
          background: white;
          padding: 6px 12px;
          border-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          white-space: nowrap;
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-3deg); }
          40% { transform: rotate(3deg); }
          60% { transform: rotate(-2deg); }
          80% { transform: rotate(2deg); }
        }

        @keyframes jampp {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-5px); }
        }

        @keyframes jampp-1 {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-6px); }
        }

        @keyframes jampp-2 {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-8px); }
        }

        @keyframes jampp-3 {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-14px); }
        }
        @keyframes jampp-4 {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-20px); }
        }

        /* Throw → Parabolic arc → Land → Disappear */
        .worry-throw {
          animation: throwOut 0.8s ease-in var(--throw-delay) forwards;
          opacity: 1;
          z-index: 100;
        }

        @keyframes throwOut {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          25% {
            transform: translate(0px, calc(0px - var(--item-index) * 15px)) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(20px, calc(-30px - var(--item-index) * 28px)) scale(1);
            opacity: 1;
          }
          75% {
            transform: translate(80px, calc(-60px - var(--item-index) * 28px)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(260px, calc(40px - var(--item-index) * 32px)) scale(1);
            opacity: 1;
          }
        }

        .worry-land {
          animation: landDisappear 0.3s ease-out calc(var(--throw-delay) + 0.6s) forwards;
        }

        @keyframes landDisappear {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(0.3);
            opacity: 0;
          }
        }

        .dark .trash-bin { background: #334155; }
        .dark .bin-lid-top { background: #475569; }
        .dark .bin-lid-handle { background: #64748b; }
        .dark .bin-panel { background: rgba(255,255,255,0.05); }
        .dark .worry-item { background: #0f172a; color: #cbd5e1; }
      `}</style>
    </div>
  );
}
