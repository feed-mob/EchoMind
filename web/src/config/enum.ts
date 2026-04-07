// 情绪光谱系统配置
export const emotionSpectrum: Record<string, { label: string, color: string; icon: string }> = {
  stress: { label: 'Stressed', color: '#6B7280', icon: 'delete_outline' },
  boredom: { label: 'Boredom', color: '#9CA3AF', icon: 'hourglass_empty' },
  anxiety: { label: 'Anxious', color: '#1E40AF', icon: 'cloud' },
  anger: { label: 'Anger', color: '#DC2626', icon: 'local_fire_department' },
  joy: { label: 'Joyful', color: '#F97316', icon: 'sentiment_very_satisfied' },
  achievement: { label: 'Achievement', color: '#EAB308', icon: 'star' },
  warmth: { label: 'Warmth', color: '#EC4899', icon: 'lightbulb' },
  calm: { label: 'Calm', color: '#22C55E', icon: 'eco' },
};

// 积极情绪列表
export const positiveEmotions = ['joy', 'achievement', 'warmth'];
export const positiveColor = '#ff6900';

// 中间情绪列表
export const neutralEmotions = ['calm'];
export const neutralColor = '#22C55E';

// 不积极情绪列表
export const negativeEmotions = ['stress', 'boredom', 'anxiety', 'anger'];
export const negativeColor = '#90a1b9';