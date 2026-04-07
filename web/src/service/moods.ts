import { buildApiUrl, throwApiError } from './http';
import type { Mood, MoodStats, RedemptionEligibility, RedemptionResult, RedemptionHistory, MoodWithAnalysis } from './types';

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

  listWithoutRedeemed: async (userId: string, kind: string): Promise<Mood[]> => {
    const params = new URLSearchParams({ userId });
    if (kind) params.append('kind', kind);

    const response = await fetch(buildApiUrl(`/api/moods_without_redeemed?${params}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch moods');
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

  // 兑换相关API方法
  getRedemptionEligibility: async (userId: string): Promise<RedemptionEligibility> => {
    const response = await fetch(buildApiUrl(`/api/moods/redemption-eligibility?userId=${userId}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch redemption eligibility');
    }
    return response.json();
  },

  dumpMoods: async (userId?: string): Promise<RedemptionResult> => {
    const response = await fetch(buildApiUrl('/api/moods/dump'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to dump moods');
    }
    return response.json();
  },

  rewardMoods: async (userId?: string): Promise<RedemptionResult> => {
    const response = await fetch(buildApiUrl('/api/moods/reward'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to reward moods');
    }
    return response.json();
  },

  getRedemptionHistory: async (userId: string, limit: number = 10, offset: number = 0): Promise<RedemptionHistory[]> => {
    const params = new URLSearchParams({ userId, limit: String(limit), offset: String(offset) });
    const response = await fetch(buildApiUrl(`/api/moods/redemption-history?${params}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch redemption history');
    }
    return response.json();
  },
};
