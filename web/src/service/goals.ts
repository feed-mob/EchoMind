import { buildApiUrl } from './http';
import type { Goal } from './types';

export const goalsApi = {
  listByGroup: async (groupId: string): Promise<Goal[]> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/goals`));
    if (!response.ok) throw new Error('Failed to fetch goals');
    return response.json();
  },

  getById: async (id: string): Promise<Goal> => {
    const response = await fetch(buildApiUrl(`/api/goals/${id}`));
    if (!response.ok) throw new Error('Failed to fetch goal');
    return response.json();
  },

  create: async (
    groupId: string,
    data: {
      title: string;
      description?: string;
      status?: string;
      successMetrics?: unknown;
      constraints?: unknown;
      selectedIdeaId?: string | null;
      selectedSettingId?: string | null;
    },
  ): Promise<Goal> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/goals`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create goal');
    return response.json();
  },

  update: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      successMetrics?: unknown;
      constraints?: unknown;
      selectedIdeaId?: string | null;
      selectedSettingId?: string | null;
    },
  ): Promise<Goal> => {
    const response = await fetch(buildApiUrl(`/api/goals/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update goal');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(buildApiUrl(`/api/goals/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete goal');
  },
};
