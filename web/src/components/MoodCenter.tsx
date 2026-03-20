import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './ToastProvider';
import { api } from '../service';
import type { Mood } from '../service/types';
import { emotionSpectrum, positiveEmotions, negativeEmotions } from "../config/enum";

export default function MoodCenter() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);
  // 动画状态：positive = 发光动画, negative = 晃动动画
  const [positiveAnimating, setPositiveAnimating] = useState(false);
  const [negativeAnimating, setNegativeAnimating] = useState(false);



  // 获取情绪历史
  const fetchMoodHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const history = await api.moods.getHistory(user.id, 5);
      setMoodHistory(history);
    } catch (err) {
      console.error('Failed to fetch mood history:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchMoodHistory();
  }, [fetchMoodHistory]);

  // 提交情绪
  const handleSubmit = async () => {
    if (!user?.id || !inputText.trim()) return;

    try {
      setIsSubmitting(true);
      const result = await api.moods.analyze(user.id, inputText.trim());

      // 根据情绪类型触发对应的动画
      const spectrum = result.spectrum || result.analysis?.spectrum;
      if (spectrum) {
        if (positiveEmotions.includes(spectrum)) {
          setPositiveAnimating(true);
          setTimeout(() => setPositiveAnimating(false), 3000);
        } else if (negativeEmotions.includes(spectrum)) {
          setNegativeAnimating(true);
          setTimeout(() => setNegativeAnimating(false), 2000);
        }
      }

      toast.success('Mood recorded!');
      setInputText('');
      await fetchMoodHistory();
    } catch (err) {
      console.error('Failed to analyze mood:', err);
      toast.error('Failed to analyze mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取最近的情绪颜色（用于背景）
  const getRecentMoodColor = () => {
    if (moodHistory.length === 0) return null;
    const recent = moodHistory[0];
    const spectrum = recent.spectrum || 'calm';
    return emotionSpectrum[spectrum]?.color || null;
  };

  const recentColor = getRecentMoodColor();

  return (
    <div
      className="group bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-lg relative overflow-hidden"
      style={recentColor ? {
        background: `linear-gradient(135deg, ${recentColor}20 0%, ${recentColor}40 100%)`,
        borderColor: `${recentColor}60`
      } : undefined}
    >
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
        <span className="material-icons text-8xl text-primary">sentiment_satisfied</span>
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-icons text-primary">auto_awesome</span>
          <h3 className="text-indigo-900 dark:text-indigo-200 font-extrabold text-xl">Mind Space</h3>
        </div>
        <p className="text-indigo-800/80 dark:text-indigo-300/80 text-sm mb-6 leading-relaxed">
          Your Mind Space: Shed troubles, store joy. Turn gray moments into space and bright ones into sweet rewards.
        </p>
        <div className="flex gap-4 mb-8">
          <div className="group/item flex-1 bg-white/60 dark:bg-slate-900/40 backdrop-blur p-3 rounded-xl border border-white dark:border-slate-700 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all">
            <div onClick={() => navigate('/my-mood?kind=positive')} className={`size-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 ${positiveAnimating ? 'animate-glow' : ''}`}>
              <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor">
                <path d="M706.56 47.018667a42.666667 42.666667 0 0 1 37.717333 0.085333l58.453334 29.013333 0.213333 0.128c11.733333 5.888 24.704 8.96 37.845333 9.088H896a42.666667 42.666667 0 0 1 42.666667 42.666667v55.466667c0 10.112 1.664 19.712 4.864 28.288l3.712 8.277333 0.597333 1.194667 29.013333 58.453333a42.666667 42.666667 0 0 1-29.866666 60.8l-155.904 31.146667a254.037333 254.037333 0 0 1-1.152 195.114666 253.696 253.696 0 0 1-55.808 82.048l-85.333334 85.333334a253.781333 253.781333 0 0 1-277.12 56.96l-31.146666 155.946666a42.666667 42.666667 0 0 1-60.842667 29.866667l-58.453333-29.013333-0.213334-0.170667a85.504 85.504 0 0 0-28.032-8.448L183.168 938.666667H128a42.666667 42.666667 0 0 1-42.666667-42.666667v-55.210667a85.418667 85.418667 0 0 0-9.088-37.845333l-0.128-0.213333-29.013333-58.453334a42.666667 42.666667 0 0 1 29.866667-60.8l155.904-31.189333a254.08 254.08 0 0 1 1.152-195.072 253.866667 253.866667 0 0 1 56.064-82.346667l85.077333-85.034666a253.866667 253.866667 0 0 1 277.12-56.96l31.189333-155.946667 1.28-4.778667a42.666667 42.666667 0 0 1 21.76-25.130666zM148.224 756.181333l4.266667 8.618667c11.776 23.466667 17.92 49.28 18.133333 75.477333V853.333333h13.013333c26.197333 0.128 52.053333 6.357333 75.434667 18.048l8.618667 4.266667 26.794666-134.101333c-2.090667-1.92-4.181333-3.882667-6.229333-5.888l-5.973333-6.272-134.058667 26.794666zM554.666667 299.264a168.661333 168.661333 0 0 0-85.333334 24.106667v401.28a168.533333 168.533333 0 0 0 85.333334-24.106667V299.264z m-204.8 136.533333a168.704 168.704 0 0 0-37.930667 184.490667A168.661333 168.661333 0 0 0 384 702.293333V401.706667l-34.133333 34.133333z m290.133333 186.496l34.133333-34.133333a168.618667 168.618667 0 0 0-34.133333-266.538667v300.672z m89.386667-339.925333c2.133333 1.962667 4.266667 3.925333 6.272 5.973333 2.005333 2.005333 3.968 4.096 5.888 6.186667l134.101333-26.794667-4.266667-8.576A162.986667 162.986667 0 0 1 853.333333 183.424V170.666667h-13.056a170.794667 170.794667 0 0 1-75.477333-18.090667l-8.618667-4.266667-26.794666 134.101334z"></path>
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">Candy Jar</span>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Store joy</p>
          </div>
          <div className="group/item flex-1 bg-white/60 dark:bg-slate-900/40 backdrop-blur p-3 rounded-xl border border-white dark:border-slate-700 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all">
            <div onClick={() => navigate('/my-mood?kind=negative')} className={`size-12 rounded-full bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center text-slate-400 ${negativeAnimating ? 'animate-shake' : ''}`}>
              <span className="material-icons text-3xl">delete_outline</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Recycle</span>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Shed troubles</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">How are you today?</p>
          <div className="relative">
            <input
              className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary shadow-inner"
              placeholder="Record your mood..."
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && inputText.trim() && !isSubmitting) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              disabled={isSubmitting}
            />
            <button
              className="absolute right-2 top-1.5 size-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-50"
              onClick={() => void handleSubmit()}
              disabled={!inputText.trim() || isSubmitting}
            >
              <span className="material-icons text-sm">{isSubmitting ? 'hourglass_empty' : 'send'}</span>
            </button>
          </div>
          {/* 情绪历史预览 */}
          {moodHistory.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {moodHistory.slice(0, 3).map((mood) => {
                const spectrum = mood.spectrum || 'calm';
                const config = emotionSpectrum[spectrum];
                return (
                  <div
                    key={mood.id}
                    className="flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 rounded-full px-2 py-0.5 text-xs"
                    title={mood.notes || ''}
                  >
                    <span className="material-icons text-[10px]" style={{ color: config?.color }}>
                      {config?.icon || 'sentiment_satisfied'}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">{mood?.emotion}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
