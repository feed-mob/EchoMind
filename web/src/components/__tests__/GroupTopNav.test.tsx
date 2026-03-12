import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GroupTopNav from '../GroupTopNav';

const { mockNavigate, mockLogout } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockLogout: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'roofeel@example.com',
      name: 'roofeel',
      avatar: null,
    },
    logout: mockLogout,
  }),
}));

describe('GroupTopNav', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogout.mockReset();
  });

  it('navigates to target tabs and settings', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GroupTopNav group={{ id: 'group-1', name: 'Team A' }} activeTab="ideas" aiGoalId="goal-9" />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Back to groups' }));
    await user.click(screen.getByRole('button', { name: 'Goals' }));
    await user.click(screen.getByRole('button', { name: 'Ideas' }));
    await user.click(screen.getByRole('button', { name: /AI Evaluate/ }));
    await user.click(screen.getByRole('button', { name: 'Group settings' }));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/group');
    expect(mockNavigate).toHaveBeenNthCalledWith(2, '/group/group-1/goals');
    expect(mockNavigate).toHaveBeenNthCalledWith(3, '/group/group-1/ideas');
    expect(mockNavigate).toHaveBeenNthCalledWith(4, '/group/group-1/ai-evaluate?goalId=goal-9');
    expect(mockNavigate).toHaveBeenNthCalledWith(5, '/group/group-1/settings');
  });

  it('renders goals before ideas', () => {
    render(
      <MemoryRouter>
        <GroupTopNav group={{ id: 'group-3', name: 'Team C' }} activeTab="goals" />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole('button');
    const goalsIndex = buttons.findIndex((button) => button.textContent?.includes('Goals'));
    const ideasIndex = buttons.findIndex((button) => button.textContent?.includes('Ideas'));

    expect(goalsIndex).toBeGreaterThan(-1);
    expect(ideasIndex).toBeGreaterThan(-1);
    expect(goalsIndex).toBeLessThan(ideasIndex);
  });

  it('omits goal query when aiGoalId is absent', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GroupTopNav group={{ id: 'group-2', name: 'Team B' }} activeTab="goals" />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /AI Evaluate/ }));

    expect(mockNavigate).toHaveBeenCalledWith('/group/group-2/ai-evaluate');
  });

  it('opens user menu and logs out', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GroupTopNav group={{ id: 'group-4', name: 'Team D' }} activeTab="goals" />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.getByRole('menu', { name: 'User menu' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Logout' }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
