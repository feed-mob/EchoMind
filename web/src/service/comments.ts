import { buildApiUrl } from './http';
import type { IdeaComment } from './types';

export const commentsApi = {
  listByIdea: async (ideaId: string): Promise<IdeaComment[]> => {
    const response = await fetch(buildApiUrl(`/api/ideas/${ideaId}/comments`));
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  create: async (ideaId: string, data: { content: string; authorId: string }): Promise<IdeaComment> => {
    const response = await fetch(buildApiUrl(`/api/ideas/${ideaId}/comments`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
  },

  update: async (commentId: string, data: { content: string; authorId: string }): Promise<IdeaComment> => {
    const response = await fetch(buildApiUrl(`/api/comments/${commentId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return response.json();
  },

  delete: async (commentId: string, data: { authorId: string }): Promise<void> => {
    const response = await fetch(buildApiUrl(`/api/comments/${commentId}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },
};
