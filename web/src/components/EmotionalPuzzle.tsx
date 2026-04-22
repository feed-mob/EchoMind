import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from '../service';
import type { RedemptionEligibility, RedemptionHistory, RedemptionResult } from '../service/types';
import { withMinDuration } from "../tools/functions";
import { RewardImage, type ImageStatus } from "./RewardImage";

// 拼图块类型
interface PuzzlePiece {
  id: number;
  path: string;
  color: string;
  strokeColor: string;
}

interface EmotionalPuzzleProps {
  quote?: string;
  userId?: string;
  redemptionEligibility?: RedemptionEligibility | null;
  redemptionHistory?: RedemptionHistory[];
  onGetReward?: () => void;
}

// 预定义的励志名言列表
const INSPIRATIONAL_QUOTES = [
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your positive action combined with positive thinking results in success.", author: "Shiv Khera" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
];

// 获取随机名言
function getRandomQuote(): { text: string; author: string } {
  const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
  return INSPIRATIONAL_QUOTES[randomIndex];
}

export default function EmotionalPuzzle({
    redemptionEligibility,
    redemptionHistory = [],
    userId,
    quote = "Every step forward is progress. Keep going!",
    onGetReward
  }: EmotionalPuzzleProps) {

  // 状态管理
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<{ text: string; author: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 图片生成相关状态
  const [redemptionId, setRedemptionId] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<ImageStatus>('pending');
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const redemptionPositveHistory = useMemo(() => {
    return redemptionHistory.filter((item) => (item.sentiment == 'positive'))
  }, [redemptionHistory]);

  const handleGetReward = async () => {
    // 检查兑换资格
    if (!userId || !redemptionEligibility?.positive.canRedeem) {
      setError(`You need at least ${redemptionEligibility?.positive.base} positive mood days to get reward`);
      return;
    }

    setIsRedeeming(true);
    setError(null);

    try {
      // 调用API，至少显示3秒loading动画
      const result: RedemptionResult = await withMinDuration(
        api.moods.rewardMoods(userId),
        3000
      );

      // 兑换成功，保存 redemption ID
      setRedemptionId(result.redemption.id);
      setImageStatus(result.redemption.imageStatus as ImageStatus);

      // 如果图片已经完成，直接显示
      if (result.redemption.imageData) {
        setImageData(result.redemption.imageData);
        setImageStatus('completed');
      } else {
        // 开始轮询图片状态
        startPolling(result.redemption.id);
      }

      // 兑换成功
      setIsRedeeming(false);
      setIsRedeemed(true);

      // 随机选择一条名言
      const randomQuote = getRandomQuote();
      setCurrentQuote(randomQuote);

      // 调用父组件回调
      if (onGetReward) {
        onGetReward();
      }
    } catch (err) {
      setIsRedeeming(false);
      setError(err instanceof Error ? err.message : 'Failed to get reward');
    }
  };

  const handleCloseModal = () => {
    setIsRedeemed(false);
    // 清理轮询
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  // 轮询检查图片生成状态
  const startPolling = useCallback((id: string) => {
    // 每 5 秒检查一次
    const interval = setInterval(async () => {
      try {
        const response = await api.moods.getRedemptionImage(id);
        if (response) {
          setImageStatus(response.imageStatus as ImageStatus);

          if (response.imageStatus === 'completed' && response.imageData) {
            setImageData(response.imageData);
            clearInterval(interval);
            setPollInterval(null);
          } else if (response.imageStatus === 'failed') {
            clearInterval(interval);
            setPollInterval(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch redemption image status:', err);
      }
    }, 5000);

    setPollInterval(interval);

    // 设置超时，最多轮询 5 分钟
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollInterval(null);
      }
    }, 5 * 60 * 1000);
  }, []);

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // 历史记录弹窗状态
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<RedemptionHistory | null>(null);

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
          <div className="flex items-center justify-center px-6 pt-8 pb-8 text-center">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            {redemptionEligibility && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {redemptionEligibility.positive.canRedeem
                    ? `You have ${redemptionEligibility.positive.count} positive mood days. Click to redeem them!`
                    : `You need ${redemptionEligibility.positive.nextLevelNeed} more positive mood days to redeem your Reward.`
                  }
                </p>
              </div>
            )}
          </div>

          <div className="puzzle-container flex-1 flex items-center justify-center md:p-4">
            <svg
              viewBox="0 0 500 500"
              className="w-full md:w-[500px] aspect-square"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
            >
              {puzzlePieces.map((piece, index) => (
                <g
                  key={piece.id}
                  className="puzzle-piece"
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d={piece.path}
                    fill={(redemptionEligibility?.positive.count || 0) > index ? piece.color : '#eee'}
                    stroke={(redemptionEligibility?.positive.count || 0) > index ? piece.strokeColor : '#bbb'}
                    strokeWidth="1"
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

            {/* Quote Overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
              <div className="max-w-md">
                <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white italic leading-tight">
                  "{quote}"
                </p>
              </div>
            </div>
          </div>

          {/* Reward Button */}
          <div className="flex justify-center p-10">
            <button
              onClick={handleGetReward}
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-black text-xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all flex items-center gap-3 cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none"
              disabled={!redemptionEligibility?.positive.canRedeem || isRedeeming}
            >
              {isRedeeming ? (
                <>
                  <span className="material-icons animate-spin">refresh</span>
                  Processing...
                </>
              ) : (
                <>
                  {redemptionEligibility?.positive.canRedeem && (
                    <span className="material-icons animate-bounce">card_giftcard</span>
                  )}
                  Get Reward
                </>
              )}
              <div className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
            </button>
          </div>

          {/* Redemption History */}
          {redemptionPositveHistory.length > 0 && (
            <div className="px-6 pb-8">
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Recent Reward</h3>
                <div className="space-y-2">
                  {redemptionPositveHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      onClick={() => setSelectedHistoryItem(record)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          You got {record.level} level Reward: {record.reward}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.imageData && (
                          <img
                            src={record.imageData}
                            alt="Reward"
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Success Modal */}
      {isRedeemed && currentQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Celebration Header */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 p-6 text-center">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-1">Congratulations!</h2>
              <p className="text-white/90 text-base">You've unlocked your reward</p>
            </div>

            {/* AI Generated Image Section */}
            <div className="p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 text-center">
                🎨 Your AI-Generated Reward
              </h3>
              {redemptionId ? (
                <RewardImage
                  imageData={imageData || undefined}
                  status={imageStatus}
                  description={currentQuote.text}
                  className="w-full max-w-md mx-auto"
                />
              ) : (
                <div className="flex items-center justify-center p-8 bg-gray-100 rounded-xl">
                  <p className="text-gray-500">Loading...</p>
                </div>
              )}
            </div>

            {/* Quote Content */}
            <div className="p-6 text-center">
              <div className="text-amber-500 text-3xl mb-4">"</div>
              <blockquote className="text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed mb-4">
                {currentQuote.text}
              </blockquote>
              <cite className="text-slate-500 dark:text-slate-400 not-italic text-sm">
                — {currentQuote.author}
              </cite>

              {/* Decorative Elements */}
              <div className="mt-6 flex justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="w-2 h-2 rounded-full bg-pink-500" />
              </div>
            </div>

            {/* Footer with Close Button */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Image Modal */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedHistoryItem(null)} />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 p-6 text-center">
              <div className="text-4xl mb-2">🎁</div>
              <h2 className="text-xl font-bold text-white mb-1">Your Reward</h2>
              <p className="text-white/90 text-sm">Level {selectedHistoryItem.level} • {new Date(selectedHistoryItem.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Image Section - 直接使用 img 标签显示图片 */}
            <div className="p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              {selectedHistoryItem.imageData ? (
                <img
                  src={selectedHistoryItem.imageData}
                  alt="Reward"
                  className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                />
              ) : (
                <div className="flex items-center justify-center p-8 bg-gray-100 rounded-xl">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Reward Info */}
            <div className="p-6 text-center">
              <div className="text-indigo-500 text-2xl mb-2">✨</div>
              <p className="text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed mb-2">
                {selectedHistoryItem.reward}
              </p>

              {/* Decorative Elements */}
              <div className="mt-4 flex justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
            </div>

            {/* Footer with Close Button */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style>{`
        .puzzle-container {
          margin: 0 auto;
          background-color: transparent;
          overflow: hidden;
          position: relative;
        }
      `}</style>
    </div>
  );
}
