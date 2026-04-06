import { describe, expect, it } from 'vitest';
import { getStatusMeta, normalizeGoal } from '../utils';

describe('GroupGoals utils', () => {
  it('normalizes nullable fields and converts array values to strings', () => {
    const normalized = normalizeGoal({
      id: 'goal-1',
      title: 'Launch campaign',
      description: null,
      status: '',
      successMetrics: ['Reach 10K users', 42],
      constraints: [null, 'Budget <= $5k'],
      creatorId: 'user-1',
      selectedIdeaId: undefined,
      selectedSettingId: undefined,
      groupId: 'group-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      creator: {
        id: 'user-1',
        name: 'Alice',
        avatar: 'https://example.com/avatar.png',
      },
    });

    expect(normalized.description).toBe('');
    expect(normalized.status).toBe('draft');
    expect(normalized.successMetrics).toEqual(['Reach 10K users', '42']);
    expect(normalized.constraints).toEqual(['null', 'Budget <= $5k']);
    expect(normalized.selectedIdeaId).toBeNull();
    expect(normalized.selectedSettingId).toBeNull();
    expect(normalized.creatorName).toBe('Alice');
    expect(normalized.creatorAvatar).toBe('https://example.com/avatar.png');
  });

  it('returns default status metadata for unknown status', () => {
    const meta = getStatusMeta('custom_status');

    expect(meta.label).toBe('custom_status');
    expect(meta.className).toContain('text-slate-500');
  });

  it('returns predefined metadata for known status', () => {
    const meta = getStatusMeta('in_progress');

    expect(meta.label).toBe('In Progress');
    expect(meta.className).toContain('text-primary');
  });
});
