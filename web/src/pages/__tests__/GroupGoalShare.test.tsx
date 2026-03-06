import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GroupGoalShare from '../GroupGoalShare';

const {
  mockNavigate,
  mockGroupsGetById,
  mockGoalsGetById,
  mockIdeasListByGroup,
  mockSettingsListByGroup,
  mockMembersList,
  mockResultsListBySetting,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGroupsGetById: vi.fn(),
  mockGoalsGetById: vi.fn(),
  mockIdeasListByGroup: vi.fn(),
  mockSettingsListByGroup: vi.fn(),
  mockMembersList: vi.fn(),
  mockResultsListBySetting: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../components/BrandLogo', () => ({
  default: () => <div>brand-logo</div>,
}));

vi.mock('../../service', () => ({
  api: {
    groups: {
      getById: mockGroupsGetById,
      listMembers: mockMembersList,
    },
    goals: {
      getById: mockGoalsGetById,
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/group/group-1/goals/goal-1/share']}>
      <Routes>
        <Route path="/group/:groupId/goals/:goalId/share" element={<GroupGoalShare />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GroupGoalShare', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGroupsGetById.mockReset();
    mockGoalsGetById.mockReset();
    mockIdeasListByGroup.mockReset();
    mockSettingsListByGroup.mockReset();
    mockMembersList.mockReset();
    mockResultsListBySetting.mockReset();

    mockGroupsGetById.mockResolvedValue({
      id: 'group-1',
      name: 'Team Echo',
      status: 'active',
      memberCount: 2,
      ideaCount: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    mockGoalsGetById.mockResolvedValue({
      id: 'goal-1',
      title: 'Grow retention',
      description: 'Improve monthly retention',
      status: 'in_progress',
      selectedIdeaId: 'idea-1',
      selectedSettingId: 'setting-1',
      groupId: 'group-1',
      createdAt: '2026-02-10T00:00:00.000Z',
      updatedAt: '2026-02-10T00:00:00.000Z',
    });
    mockIdeasListByGroup.mockResolvedValue([
      {
        id: 'idea-1',
        title: 'Onboarding revamp',
        content: 'Guided setup and checklist',
        status: 'active',
        groupId: 'group-1',
        authorId: 'u1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    mockSettingsListByGroup.mockResolvedValue([
      {
        id: 'setting-1',
        groupId: 'group-1',
        goalId: 'goal-1',
        model: 'gpt-5',
        impactWeight: 40,
        feasibilityWeight: 40,
        originalityWeight: 20,
        selectedIdeaIds: ['idea-1'],
        createdAt: '2026-02-10T00:00:00.000Z',
      },
    ]);
    mockMembersList.mockResolvedValue([
      {
        id: 'm1',
        userId: 'u1',
        groupId: 'group-1',
        role: 'owner',
        joinedAt: '2026-01-01T00:00:00.000Z',
        user: { id: 'u1', email: 'a@x.com', name: 'Alice Wong', avatar: null },
      },
    ]);
    mockResultsListBySetting.mockResolvedValue([
      {
        id: 'r1',
        settingId: 'setting-1',
        ideaId: 'idea-1',
        review: 'Highest expected retention impact',
        impactScore: 92,
        feasibilityScore: 88,
        originalityScore: 81,
        totalScore: 89,
        rank: 1,
        createdAt: '2026-02-10T00:00:00.000Z',
        idea: {
          id: 'idea-1',
          title: 'Onboarding revamp',
          content: 'Guided setup and checklist',
          author: { name: 'Alice Wong' },
        },
      },
    ]);
  });

  it('renders share content with selected idea and team members', async () => {
    renderPage();

    expect(screen.getByText('Loading share page...')).toBeInTheDocument();

    expect(await screen.findByText('Grow retention')).toBeInTheDocument();
    expect(screen.getByText('Onboarding revamp')).toBeInTheDocument();
    expect(screen.getByText('Highest expected retention impact')).toBeInTheDocument();
    expect(screen.getByText('Alice Wong')).toBeInTheDocument();
    expect(screen.getByText('Q1 2026')).toBeInTheDocument();
  });

  it('shows error state and navigates back', async () => {
    mockGroupsGetById.mockRejectedValueOnce(new Error('Share page failed'));
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByText('Share page failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(mockNavigate).toHaveBeenCalledWith('/group/group-1/goals');
  });
});
