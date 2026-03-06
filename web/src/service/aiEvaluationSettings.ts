import { buildApiUrl } from './http';
import type { AiEvaluationResult, AiEvaluationSetting } from './types';

export const aiEvaluationSettingsApi = {
  listByGroup: async (groupId: string): Promise<AiEvaluationSetting[]> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/ai-evaluation-settings`));
    if (!response.ok) throw new Error('Failed to fetch AI evaluation settings');
    return response.json();
  },

  create: async (
    groupId: string,
    data: {
      goalId: string;
      model: string;
      impactWeight: number;
      feasibilityWeight: number;
      originalityWeight: number;
      selectedIdeaIds: string[];
    },
  ): Promise<{ setting: AiEvaluationSetting; results: Array<Omit<AiEvaluationResult, 'id' | 'createdAt' | 'idea'>> }> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/ai-evaluation-settings`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save AI evaluation settings');
    return response.json();
  },
};
