import { buildApiUrl } from './http';
import type { Idea } from './types';

export const ideasApi = {
  listByGroup: async (groupId: string): Promise<Idea[]> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/ideas`));
    if (!response.ok) throw new Error('Failed to fetch ideas');
    return response.json();
  },

  getById: async (id: string): Promise<Idea> => {
    const response = await fetch(buildApiUrl(`/api/ideas/${id}`));
    if (!response.ok) throw new Error('Failed to fetch idea');
    return response.json();
  },

  create: async (groupId: string, data: { title: string; content?: string; authorId: string }): Promise<Idea> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/ideas`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create idea');
    return response.json();
  },

  update: async (id: string, data: { title?: string; content?: string; status?: string }): Promise<Idea> => {
    const response = await fetch(buildApiUrl(`/api/ideas/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update idea');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(buildApiUrl(`/api/ideas/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete idea');
  },
};
