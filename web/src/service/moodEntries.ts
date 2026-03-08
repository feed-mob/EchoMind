import { buildApiUrl, throwApiError } from './http';
import type { MoodEntry } from './types';

interface MoodStats {
  total: number;
  currentStreak: number;
  topEmotion: string | null;
  moodDistribution: Record<string, number>;
}

export const moodEntriesApi = {
  list: async (userId: string, startDate?: string, endDate?: string): Promise<MoodEntry[]> => {
    const params = new URLSearchParams({ userId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(buildApiUrl(`/api/mood-entries?${params}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch mood entries');
    }
    return response.json();
  },

  create: async (data: {
    userId: string;
    mood: string;
    emotion?: string;
    notes?: string;
    recordedAt?: string;
  }): Promise<MoodEntry> => {
    const response = await fetch(buildApiUrl('/api/mood-entries'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to create mood entry');
    }
    return response.json();
  },

  getStats: async (userId: string): Promise<MoodStats> => {
    const response = await fetch(buildApiUrl(`/api/mood-entries/stats?userId=${userId}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch mood stats');
    }
    return response.json();
  },

  getById: async (id: string): Promise<MoodEntry> => {
    const response = await fetch(buildApiUrl(`/api/mood-entries/${id}`));
    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch mood entry');
    }
    return response.json();
  },

  update: async (id: string, data: Partial<{
    mood: string;
    emotion: string;
    notes: string;
    recordedAt: string;
  }>): Promise<MoodEntry> => {
    const response = await fetch(buildApiUrl(`/api/mood-entries/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to update mood entry');
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(buildApiUrl(`/api/mood-entries/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to delete mood entry');
    }
  },
};