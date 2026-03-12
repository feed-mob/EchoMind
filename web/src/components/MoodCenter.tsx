import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './ToastProvider';
import { api } from '../service';
import type { Mood } from '../service/types';

// 情绪光谱系统配置
const emotionSpectrum: Record<string, { label: string; color: string; icon: string }> = {
  stress: { label: '压力', color: '#6B7280', icon: 'delete_outline' },
  boredom: { label: '无聊', color: '#9CA3AF', icon: 'hourglass_empty' },
  anxiety: { label: '焦虑', color: '#1E40AF', icon: 'cloud' },
  anger: { label: '愤怒', color: '#DC2626', icon: 'local_fire_department' },
  joy: { label: '快乐', color: '#F97316', icon: 'restaurant' },
  achievement: { label: '成就', color: '#EAB308', icon: 'star' },
  warmth: { label: '温暖', color: '#EC4899', icon: 'lightbulb' },
  calm: { label: '平静', color: '#22C55E', icon: 'eco' },
};

export default function MoodCenter() {
  const { user } = useAuth();
  const toast = useToast();
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);

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
      await api.moods.analyze(user.id, inputText.trim());
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
            <div className="size-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
              <span className="material-icons text-3xl">restaurant</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">Candy Jar</span>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Store joy</p>
          </div>
          <div className="group/item flex-1 bg-white/60 dark:bg-slate-900/40 backdrop-blur p-3 rounded-xl border border-white dark:border-slate-700 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all">
            <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center text-slate-400">
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
                    <span className="text-slate-600 dark:text-slate-300">{config?.label}</span>
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
