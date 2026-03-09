import { buildApiUrl, throwApiError } from './http';
import type { Mood } from './types';

interface MoodStats {
  total: number;
  currentStreak: number;
  topEmotion: string | null;
  moodDistribution: Record<string, number>;
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
};
