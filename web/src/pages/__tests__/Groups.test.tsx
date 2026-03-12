import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Groups from '../Groups';

const {
  mockNavigate,
  mockGroupsList,
  mockGroupsCreate,
  mockGroupsUpdate,
  mockGroupsDelete,
  mockListUserGroups,
  mockToastError,
  mockLogout,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGroupsList: vi.fn(),
  mockGroupsCreate: vi.fn(),
  mockGroupsUpdate: vi.fn(),
  mockGroupsDelete: vi.fn(),
  mockListUserGroups: vi.fn(),
  mockToastError: vi.fn(),
  mockLogout: vi.fn(),
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
      list: mockGroupsList,
      create: mockGroupsCreate,
      update: mockGroupsUpdate,
      delete: mockGroupsDelete,
    },
    users: {
      listGroups: mockListUserGroups,
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
    logout: mockLogout,
  }),
}));

vi.mock('../../components/ToastProvider', () => ({
  useToast: () => ({
    error: mockToastError,
  }),
}));

vi.mock('../../components/MoodCenter', () => ({
  default: () => <div data-testid="mood-center" />,
}));

vi.mock('../../components/NewSources', () => ({
  default: () => <div data-testid="new-sources" />,
}));

vi.mock('../../components/ConfirmModal', () => ({
  default: () => null,
}));

vi.mock('../../components/CreateGroupModal', () => ({
  default: ({ isOpen, onSubmit, mode = 'create' }: { isOpen: boolean; onSubmit: (data: { name: string }) => void; mode?: 'create' | 'edit' }) =>
    isOpen ? (
      <button
        type="button"
        onClick={() => onSubmit({ name: mode === 'edit' ? 'Edited Group' : 'Created Group' })}
      >
        {mode === 'edit' ? 'submit-edit-group' : 'submit-create-group'}
      </button>
    ) : null,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <Groups />
    </MemoryRouter>,
  );
}

const allGroups = [
  {
    id: 'group-1',
    name: 'My Group',
    icon: 'groups',
    status: 'active',
    memberCount: 4,
    ideaCount: 2,
    publicAccessEnabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'group-2',
    name: 'Public Group',
    icon: 'groups',
    status: 'processing',
    memberCount: 8,
    ideaCount: 0,
    publicAccessEnabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const memberships = [
  {
    id: 'membership-1',
    userId: 'user-1',
    groupId: 'group-1',
    role: 'owner',
    joinedAt: '2026-01-01T00:00:00.000Z',
    group: {
      id: 'group-1',
      name: 'My Group',
      status: 'active',
    },
  },
];

describe('Groups', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGroupsList.mockReset();
    mockGroupsCreate.mockReset();
    mockGroupsUpdate.mockReset();
    mockGroupsDelete.mockReset();
    mockListUserGroups.mockReset();
    mockToastError.mockReset();
    mockLogout.mockReset();

    mockGroupsList.mockResolvedValue(allGroups);
    mockListUserGroups.mockResolvedValue(memberships);
  });

  it('shows my groups and public groups after loading', async () => {
    renderPage();

    expect(screen.getByText('Loading groups...')).toBeInTheDocument();

    expect(await screen.findByText('My Groups')).toBeInTheDocument();
    expect(screen.getByText('My Group')).toBeInTheDocument();
    expect(screen.getByText('Public Group')).toBeInTheDocument();
    expect(mockGroupsList).toHaveBeenCalledTimes(1);
    expect(mockListUserGroups).toHaveBeenCalledWith('user-1');
  });

  it('creates a group from the create modal and navigates to goals page', async () => {
    mockGroupsCreate.mockResolvedValueOnce({ id: 'group-3' });
    const user = userEvent.setup();

    renderPage();

    await screen.findByText('My Groups');

    await user.click(screen.getByText('Start a new group'));
    await user.click(screen.getByRole('button', { name: 'submit-create-group' }));

    expect(mockGroupsCreate).toHaveBeenCalledWith({
      name: 'Created Group',
      icon: 'groups',
      creatorUserId: 'user-1',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/group/group-3/goals');
  });

  it('shows load error and retries successfully', async () => {
    mockGroupsList
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce([]);
    mockListUserGroups.mockResolvedValue([]);
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByText('Network unavailable')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('My Groups')).toBeInTheDocument();
    expect(mockGroupsList).toHaveBeenCalledTimes(2);
  });

  it('opens user menu and logs out', async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText('My Groups');

    await user.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.getByRole('menu', { name: 'User menu' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Logout' }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
