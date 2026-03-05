export interface GoalViewModel {
  id: string;
  title: string;
  description: string;
  status: string;
  selectedIdeaId: string | null;
  selectedSettingId: string | null;
  creatorName?: string | null;
  creatorAvatar?: string | null;
  successMetrics: string[];
  constraints: string[];
  createdAt: string;
  updatedAt: string;
}

export type GoalViewMode = 'active' | 'archived';
