import { useEffect, useState, useMemo } from "react";
import { api } from '../service';
import type { MoodStats, RedemptionEligibility, RedemptionHistory } from '../service/types';

// 拼图块类型
interface PuzzlePiece {
  id: number;
  path: string;
  color: string;
  strokeColor: string;
}

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

  // 生成7块拼图 - 7块4/5边形拼成完整正方形，PC端500x500，手机端自适应
  const puzzlePieces = useMemo<PuzzlePiece[]>(() => {
    // SVG 视图框大小，所有坐标基于此缩放
    const s = 500;

    const pieces: PuzzlePiece[] = [
      // // 块1: 左上 - 四边形 (左上不规则)
      {
        id: 1,
        path: `M 0 0
               L ${s * 0.45} 0
               L ${s * 0.55} ${s * 0.4}
               L ${s * 0} ${s * 0.35}
               Z`,
        color: '#60A5FA',
        strokeColor: '#3B82F6'
      },
      // // 块2: 右上 - 四边形 (右上不规则)
      {
        id: 2,
        path: `M ${s * 0.45} 0
               L ${s * 1} 0
               L ${s * 1} ${s * 0.3}
               L ${s * 0.55} ${s * 0.4}
               Z`,
        color: '#A78BFA',
        strokeColor: '#8B5CF6'
      },
      // // 块3: 左中 - 四边形
      {
        id: 3,
        path: `M 0 ${s * 0.35}
               L ${s * 0.55} ${s * 0.4}
               L ${s * 0.45} ${s * 0.65}
               L ${s * 0} ${s * 0.8}
               Z`,
        color: '#34D399',
        strokeColor: '#10B981'
      },
      // // 块4: 右中 - 四边形
      {
        id: 4,
        path: `M ${s * 0.55} ${s * 0.4}
               L ${s * 0.45} ${s * 0.65}
               L ${s * 0.75} ${s * 0.65}
               L ${s * 1} ${s * 0.3}
               Z`,
        color: '#F87171',
        strokeColor: '#EF4444'
      },
      // // 块5: 下左 - 四边形
      {
        id: 5,
        path: `M 0 ${s * 0.8}
               L ${s * 0.45} ${s * 0.65}
               L  ${s * 0.45} ${s * 1}
               L 0 ${s * 1}
               Z`,
        color: '#FBBF24',
        strokeColor: '#F59E0B'
      },
      // // 块6: 下中 - 四边形
      {
        id: 6,
        path: `M ${s * 0.45} ${s * 0.65}
               L ${s * 0.75} ${s * 0.65}
               L ${s * 0.9} ${s * 1}
               L ${s * 0.45} ${s * 1}
               Z`,
        color: '#22D3EE',
        strokeColor: '#06B6D4'
      },
      // // 块7:  下右 - 四边形
      {
        id: 7,
        path: `M ${s * 1} ${s * 0.3}
               L ${s * 1} ${s * 1}
               L ${s * 0.9} ${s * 1}
               L ${s * 0.75} ${s * 0.65}
               Z`,
        color: '#C084FC',
        strokeColor: '#A855F7'
      }
    ];

    return pieces;
  }, []);


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
        <div className="group relative h-full flex flex-col">

          {/* Quote Overlay */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
            <div className="max-w-md">
              <span className="material-icons text-primary mb-2 text-4xl">format_quote</span>
              <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white italic leading-tight">
                "{quote}"
              </p>
            </div>
          </div>

          <div className="puzzle-container flex-1 flex items-center justify-center md:p-4">
            <svg
              viewBox="0 0 500 500"
              className="w-full md:w-[500px] aspect-square"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
            >
              {puzzlePieces.map((piece) => (
                <g
                  key={piece.id}
                  className="puzzle-piece"
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d={piece.path}
                    fill={piece.color}
                    stroke={piece.strokeColor}
                    strokeWidth="0"
                    style={{
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'brightness(1.15)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.transformOrigin = 'center';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Reward Button */}
          <div className="flex justify-center p-10">
            <button
              onClick={handleGetReward}
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-black text-xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all flex items-center gap-3 cursor-pointer"
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
