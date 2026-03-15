import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import GoalSidebarNew from '../GoalSidebarNew';
import type { Goal } from '../types';

describe('GoalSidebarNew', () => {
  const mockGoals: Goal[] = [
    {
      id: 'goal-1',
      title: 'Quarterly Growth Goal',
      subtitle: '15% expansion • Active',
      status: 'active',
      statusColor: 'emerald',
    },
    {
      id: 'goal-2',
      title: 'Product Launch Q3',
      subtitle: 'Beta phase • In Progress',
      status: 'in_progress',
      statusColor: 'amber',
    },
    {
      id: 'goal-3',
      title: 'Brand Refresh',
      subtitle: 'Planning • On Hold',
      status: 'on_hold',
      statusColor: 'slate',
    },
  ];

  it('renders My Goals header', () => {
    render(
      <GoalSidebarNew
        goals={mockGoals}
        selectedGoalId=""
        onSelectGoal={vi.fn()}
      />
    );

    expect(screen.getByText('My Goals')).toBeInTheDocument();
  });

  it('renders all goal items', () => {
    render(
      <GoalSidebarNew
        goals={mockGoals}
        selectedGoalId=""
        onSelectGoal={vi.fn()}
      />
    );

    expect(screen.getByText('Quarterly Growth Goal')).toBeInTheDocument();
    expect(screen.getByText('Product Launch Q3')).toBeInTheDocument();
    expect(screen.getByText('Brand Refresh')).toBeInTheDocument();
  });

  it('renders goal subtitles', () => {
    render(
      <GoalSidebarNew
        goals={mockGoals}
        selectedGoalId=""
        onSelectGoal={vi.fn()}
      />
    );

    expect(screen.getByText('15% expansion • Active')).toBeInTheDocument();
    expect(screen.getByText('Beta phase • In Progress')).toBeInTheDocument();
    expect(screen.getByText('Planning • On Hold')).toBeInTheDocument();
  });

  it('marks selected goal with active styling', () => {
    render(
      <GoalSidebarNew
        goals={mockGoals}
        selectedGoalId="goal-1"
        onSelectGoal={vi.fn()}
      />
    );

    const selectedGoal = screen.getByText('Quarterly Growth Goal').closest('a');
    expect(selectedGoal).toHaveClass('bg-primary/10', 'border-primary');
  });

  it('calls onSelectGoal when a goal is clicked', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <GoalSidebarNew
        goals={mockGoals}
        selectedGoalId=""
        onSelectGoal={handleSelect}
      />
    );

    await user.click(screen.getByText('Quarterly Growth Goal'));
    expect(handleSelect).toHaveBeenCalledWith('goal-1');
  });

  it('renders status indicators with correct colors', () => {
    render(
      <GoalSidebarNew
        goals={mockGoals}
        selectedGoalId=""
        onSelectGoal={vi.fn()}
      />
    );

    const statusIndicators = document.querySelectorAll('.size-2.rounded-full');
    expect(statusIndicators).toHaveLength(3);
  });

  it('renders empty state when no goals provided', () => {
    render(
      <GoalSidebarNew
        goals={[]}
        selectedGoalId=""
        onSelectGoal={vi.fn()}
      />
    );

    expect(screen.getByText('My Goals')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
