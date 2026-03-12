import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GoalsSidebar from '../GoalsSidebar';

describe('GoalsSidebar', () => {
  it('does not render unknown creator text when creator info is missing', () => {
    render(
      <GoalsSidebar
        visibleGoals={[
          {
            id: 'goal-1',
            title: 'Ship MVP',
            description: 'First release',
            status: 'draft',
            selectedIdeaId: null,
            selectedSettingId: null,
            successMetrics: [],
            constraints: [],
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ]}
        selectedGoalId=""
        viewMode="active"
        searchText=""
        onSelectGoal={vi.fn()}
        onSearchChange={vi.fn()}
        onChangeViewMode={vi.fn()}
        onCreateGoal={vi.fn()}
      />,
    );

    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
    expect(screen.getByText('Ship MVP')).toBeInTheDocument();
  });
});
