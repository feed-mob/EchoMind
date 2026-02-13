export interface GoalViewModel {
  id: string;
  title: string;
  description: string;
  status: string;
  successMetrics: string[];
  constraints: string[];
  createdAt: string;
  updatedAt: string;
}

export type GoalViewMode = 'active' | 'archived';
