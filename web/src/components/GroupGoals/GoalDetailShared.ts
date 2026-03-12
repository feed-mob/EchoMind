export type GoalDetailTab = 'detail' | 'sources';

export interface GoalIdeaSummary {
  id: string;
  title: string;
  rank: number | null;
  score: number | null;
  review: string | null;
}

export interface GoalSourceItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  action: string;
  icon: string;
  accentClass: string;
  meta: string;
}
