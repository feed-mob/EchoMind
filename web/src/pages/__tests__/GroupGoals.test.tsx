import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GroupGoals from '../GroupGoals';

const {
  mockNavigate,
  mockGroupsGetById,
  mockGoalsListByGroup,
  mockGoalsCreate,
  mockIdeasListByGroup,
  mockSettingsListByGroup,
  mockResultsListBySetting,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGroupsGetById: vi.fn(),
  mockGoalsListByGroup: vi.fn(),
  mockGoalsCreate: vi.fn(),
  mockIdeasListByGroup: vi.fn(),
  mockSettingsListByGroup: vi.fn(),
  mockResultsListBySetting: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../service', () => ({
  api: {
    groups: {
      getById: mockGroupsGetById,
    },
    goals: {
      listByGroup: mockGoalsListByGroup,
      create: mockGoalsCreate,
      update: vi.fn(),
      delete: vi.fn(),
    },
    ideas: {
      listByGroup: mockIdeasListByGroup,
    },
    aiEvaluationSettings: {
      listByGroup: mockSettingsListByGroup,
    },
    aiEvaluationResults: {
      listBySetting: mockResultsListBySetting,
    },
  },
}));

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'roofeel@example.com',
      name: 'roofeel',
      avatar: null,
    },
  }),
}));

vi.mock('../../components/GroupTopNav', () => ({
  default: ({ activeTab }: { activeTab: string }) => <div data-testid="group-top-nav">tab:{activeTab}</div>,
}));

vi.mock('../../components/GroupGoals/AnimatedSeedling', () => ({
  default: () => <div data-testid="animated-seedling" />,
}));

vi.mock('../../components/GroupGoals/GoalsSidebar', () => ({
  default: ({
    visibleGoals,
    onSelectGoal,
    onCreateGoal,
    onChangeViewMode,
  }: {
    visibleGoals: Array<{ id: string; title: string }>;
    onSelectGoal: (goalId: string) => void;
    onCreateGoal: () => void;
    onChangeViewMode: (mode: 'active' | 'archived') => void;
  }) => (
    <div>
      <button onClick={onCreateGoal}>create-goal</button>
      <button onClick={() => onChangeViewMode('active')}>filter-active</button>
      <button onClick={() => onChangeViewMode('archived')}>filter-archived</button>
      {visibleGoals.map((goal) => (
        <button key={goal.id} onClick={() => onSelectGoal(goal.id)}>
          goal:{goal.title}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../components/GroupGoals/GoalDetailView', () => ({
  default: ({ selectedGoal, onEdit }: { selectedGoal: { title: string }; onEdit: () => void }) => (
    <div>
      <div>goal-detail:{selectedGoal.title}</div>
      <button onClick={onEdit}>edit-goal</button>
    </div>
  ),
}));

vi.mock('../../components/GroupGoals/GoalEditor', () => ({
  default: ({ onSaveGoal }: { onSaveGoal: () => void }) => (
    <div>
      <div>goal-editor</div>
      <button onClick={onSaveGoal}>save-goal</button>
    </div>
  ),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/group/group-1/goals']}>
      <Routes>
        <Route path="/group/:groupId/goals" element={<GroupGoals />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GroupGoals', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGroupsGetById.mockReset();
    mockGoalsListByGroup.mockReset();
    mockGoalsCreate.mockReset();
    mockIdeasListByGroup.mockReset();
    mockSettingsListByGroup.mockReset();
    mockResultsListBySetting.mockReset();

    mockGroupsGetById.mockResolvedValue({
      id: 'group-1',
      name: 'Team Alpha',
      status: 'active',
      memberCount: 3,
      ideaCount: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    mockGoalsListByGroup.mockResolvedValue([
      {
        id: 'goal-1',
        title: 'Active Goal',
        description: 'active',
        status: 'in_progress',
        successMetrics: [],
        constraints: [],
        groupId: 'group-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'goal-2',
        title: 'Archived Goal',
        description: 'archived',
        status: 'archived',
        successMetrics: [],
        constraints: [],
        groupId: 'group-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    mockIdeasListByGroup.mockResolvedValue([]);
    mockSettingsListByGroup.mockResolvedValue([]);
    mockResultsListBySetting.mockResolvedValue([]);
  });

  it('loads and filters goals by view mode', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText('Loading goals...')).toBeInTheDocument();

    expect(await screen.findByTestId('group-top-nav')).toHaveTextContent('tab:goals');
    expect(screen.getByText('goal:Active Goal')).toBeInTheDocument();
    expect(screen.queryByText('goal:Archived Goal')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'filter-archived' }));
    expect(await screen.findByText('goal:Archived Goal')).toBeInTheDocument();
    expect(screen.queryByText('goal:Active Goal')).not.toBeInTheDocument();
  });

  it('shows validation error when saving a new goal without title', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByTestId('group-top-nav');

    await user.click(screen.getByRole('button', { name: 'create-goal' }));
    expect(screen.getByText('goal-editor')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'save-goal' }));

    expect(await screen.findByText('Goal title is required')).toBeInTheDocument();
    expect(mockGoalsCreate).not.toHaveBeenCalled();
  });

  it('shows error state and goes back to groups', async () => {
    mockGroupsGetById.mockRejectedValueOnce(new Error('Cannot load group'));
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByText('Cannot load group')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to Groups' }));
    expect(mockNavigate).toHaveBeenCalledWith('/group');
  });
});
