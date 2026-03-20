import { buildApiUrl, throwApiError } from './http';
import type { Mood, EmotionAnalysisResult } from './types';

interface MoodStats {
  total: number;
  streakDays: number;
  mostFrequentMood: string | null;
  moodDistribution: Record<string, number>;
}

interface MoodWithAnalysis extends Mood {
  analysis?: EmotionAnalysisResult;
}

export const moodsApi = {
  list: async (userId: string, startDate?: string, endDate?: string): Promise<Mood[]> => {
    const params = new URLSearchParams({ userId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(buildApiUrl(`/api/moods?${params}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch moods');
    }
    return response.json();
  },

  create: async (data: {
    userId: string;
    mood: string;
    emotion?: string;
    notes?: string;
    recordedAt?: string;
  }): Promise<Mood> => {
    const response = await fetch(buildApiUrl('/api/moods'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to create mood');
    }
    return response.json();
  },

  getStats: async (userId: string): Promise<MoodStats> => {
    const response = await fetch(buildApiUrl(`/api/moods/stats?userId=${userId}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch mood stats');
    }
    return response.json();
  },

  getById: async (id: string): Promise<Mood> => {
    const response = await fetch(buildApiUrl(`/api/moods/${id}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch mood');
    }
    return response.json();
  },

  update: async (id: string, data: Partial<{
    mood: string;
    emotion: string;
    notes: string;
    recordedAt: string;
  }>): Promise<Mood> => {
    const response = await fetch(buildApiUrl(`/api/moods/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to update mood');
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(buildApiUrl(`/api/moods/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to delete mood');
    }
  },

  // AI 情绪分析接口
  analyze: async (userId: string, text: string): Promise<MoodWithAnalysis> => {
    const response = await fetch(buildApiUrl('/api/moods/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text }),
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to analyze mood');
    }
    return response.json();
  },

  // 获取情绪历史（带分析结果）
  getHistory: async (userId: string, limit: number = 10): Promise<MoodWithAnalysis[]> => {
    const params = new URLSearchParams({ userId, limit: String(limit) });
    const response = await fetch(buildApiUrl(`/api/moods/history?${params}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch mood history');
    }
    return response.json();
  },

  // 获取最近的情绪光谱（用于动态背景）
  getSpectrum: async (userId: string, days: number = 7): Promise<{ spectrums: string[] }> => {
    const params = new URLSearchParams({ userId, days: String(days) });
    const response = await fetch(buildApiUrl(`/api/moods/spectrum?${params}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch mood spectrum');
    }
    return response.json();
  },

  // Team mood analytics methods - groupId is obtained from current user session
  getTeamStats: async (userId: string, timeRange: '7' | '30' | '90' = '7'): Promise<{ averageMood: number; participationRate: number; topEmotion: string | null; totalEntries: number; activeMembers: number }> => {
    const response = await fetch(buildApiUrl(`/api/moods/team-stats?userId=${userId}&timeRange=${timeRange}`));
    if (!response.ok) throw new Error('Failed to fetch team mood stats');
    return response.json();
  },

  getTeamDistribution: async (userId: string, timeRange: '7' | '30' | '90' = '7'): Promise<{ mood: string; count: number; percentage: number }[]> => {
    const response = await fetch(buildApiUrl(`/api/moods/team-distribution?userId=${userId}&timeRange=${timeRange}`));
    if (!response.ok) throw new Error('Failed to fetch team mood distribution');
    return response.json();
  },

  getTeamTrend: async (userId: string, timeRange: '7' | '30' | '90' = '7'): Promise<{ date: string; averageMood: number; entries: number }[]> => {
    const response = await fetch(buildApiUrl(`/api/moods/team-trend?userId=${userId}&timeRange=${timeRange}`));
    if (!response.ok) throw new Error('Failed to fetch team mood trend');
    return response.json();
  },

  getTeamInsights: async (userId: string, timeRange: '7' | '30' | '90' = '7'): Promise<{ positiveTrends: string[]; areasForImprovement: string[]; recommendations: string[] }> => {
    const response = await fetch(buildApiUrl(`/api/moods/team-insights?userId=${userId}&timeRange=${timeRange}`));
    if (!response.ok) throw new Error('Failed to fetch team insights');
    return response.json();
  },
};
