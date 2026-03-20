// 情绪光谱系统配置
export const emotionSpectrum: Record<string, { color: string; icon: string }> = {
  stress: {  color: '#6B7280', icon: 'delete_outline' },
  boredom: { color: '#9CA3AF', icon: 'hourglass_empty' },
  anxiety: { color: '#1E40AF', icon: 'cloud' },
  anger: { color: '#DC2626', icon: 'local_fire_department' },
  joy: { color: '#F97316', icon: 'restaurant' },
  achievement: { color: '#EAB308', icon: 'star' },
  warmth: { color: '#EC4899', icon: 'lightbulb' },
  calm: { color: '#22C55E', icon: 'eco' },
};

// 积极情绪列表
export const positiveEmotions = ['joy', 'achievement', 'warmth', 'calm'];
export const positiveColor = '#ff6900';

// 中间情绪颜色
export const neutralColor = '#137fec';

// 不积极情绪列表
export const negativeEmotions = ['stress', 'boredom', 'anxiety', 'anger'];
export const negativeColor = '#90a1b9';