import type { Goal as ApiGoal } from '../../service';
import type { GoalViewModel } from './types';

const goalStatusMeta: Record<string, { label: string; className: string }> = {
  in_progress: { label: 'In Progress', className: 'text-primary bg-primary/20' },
  draft: { label: 'Draft', className: 'text-slate-400 bg-slate-100 dark:bg-slate-800' },
  paused: { label: 'Paused', className: 'text-amber-500 bg-amber-500/10' },
  planning: { label: 'Planning', className: 'text-emerald-500 bg-emerald-500/10' },
  archived: { label: 'Archived', className: 'text-slate-500 bg-slate-200 dark:bg-slate-700' },
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
};

export const normalizeGoal = (goal: ApiGoal): GoalViewModel => ({
  ...(() => {
    const raw = goal as ApiGoal & {
      creator?: { name?: string | null; avatar?: string | null };
      creatorName?: string | null;
      creatorAvatar?: string | null;
    };
    return {
      creatorName: raw.creator?.name ?? raw.creatorName ?? null,
      creatorAvatar: raw.creator?.avatar ?? raw.creatorAvatar ?? null,
    };
  })(),
  id: goal.id,
  title: goal.title,
  description: goal.description || '',
  status: goal.status || 'draft',
  selectedIdeaId: goal.selectedIdeaId ?? null,
  selectedSettingId: goal.selectedSettingId ?? null,
  successMetrics: toStringArray(goal.successMetrics),
  constraints: toStringArray(goal.constraints),
  createdAt: goal.createdAt,
  updatedAt: goal.updatedAt,
});

export const getStatusMeta = (status: string) => {
  return goalStatusMeta[status] || {
    label: status || 'Draft',
    className: 'text-slate-500 bg-slate-200 dark:bg-slate-700',
  };
};
