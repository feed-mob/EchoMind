import { buildApiUrl } from './http';
import type { AiEvaluationResult } from './types';

export const aiEvaluationResultsApi = {
  listBySetting: async (settingId: string): Promise<AiEvaluationResult[]> => {
    const response = await fetch(buildApiUrl(`/api/ai-evaluation-settings/${settingId}/results`));
    if (!response.ok) throw new Error('Failed to fetch AI evaluation results');
    return response.json();
  },
};
