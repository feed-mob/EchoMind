import { aiEvaluationResultsApi } from './aiEvaluationResults';
import { aiEvaluationSettingsApi } from './aiEvaluationSettings';
import { commentsApi } from './comments';
import { goalsApi } from './goals';
import { groupsApi } from './groups';
import { ideasApi } from './ideas';
import { moodsApi } from './moods';
import { usersApi } from './users';

export const api = {
  users: usersApi,
  groups: groupsApi,
  ideas: ideasApi,
  comments: commentsApi,
  goals: goalsApi,
  aiEvaluationSettings: aiEvaluationSettingsApi,
  aiEvaluationResults: aiEvaluationResultsApi,
  moods: moodsApi,
};

export * from './types';
