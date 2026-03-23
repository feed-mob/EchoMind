
import type { Mood } from '../service/types';
import { positiveEmotions, neutralEmotions, negativeEmotions } from '../config/enum';

/**
 * 根据 心情 列表数据，得到每天的心情是积极还是不积极的
 * 需要根据每天的积极心情或不积极心情数量来判断
 * @param entries
 * @return Object {date:'positive'}
 */
export const generateDayMood = (entries: Mood[]): Record<string, 'positive' | 'neutral' | 'negative'> => {
  if (!entries || entries.length === 0) return {};

  const dayMoodMap = new Map<string, { positive: number; neutral: number; negative: number }>();

  entries.forEach((entry) => {
    if (!entry.mood || !entry.recordedAt) return;

    const date = new Date(entry.recordedAt).toISOString().split('T')[0];

    if (!dayMoodMap.has(date)) {
      dayMoodMap.set(date, { positive: 0, neutral: 0, negative: 0 });
    }

    const dayData = dayMoodMap.get(date)!;

    if (positiveEmotions.includes(entry.mood)) {
      dayData.positive++;
    } else if (neutralEmotions.includes(entry.mood)) {
      dayData.neutral++;
    } else if (negativeEmotions.includes(entry.mood)) {
      dayData.negative++;
    }
  });

  const result: Record<string, 'positive' | 'neutral' | 'negative'> = {};

  dayMoodMap.forEach((data, date) => {
    if (data.positive > data.negative && data.positive > data.neutral) {
      result[date] = 'positive';
    } else if (data.negative > data.positive && data.negative > data.neutral) {
      result[date] = 'negative';
    } else {
      result[date] = 'neutral';
    }
  });

  return result;
};