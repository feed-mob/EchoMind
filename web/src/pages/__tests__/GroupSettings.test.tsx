import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GroupSettings from '../GroupSettings';

const { mockNavigate, mockGetById } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGetById: vi.fn(),
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
      getById: mockGetById,
    },
  },
}));

vi.mock('../../components/GroupTopNav', () => ({
  default: ({ activeTab }: { activeTab: string }) => <div data-testid="group-top-nav">tab:{activeTab}</div>,
}));

vi.mock('../../components/GroupSettings/GroupSettingsContent', () => ({
  default: ({ groupId }: { groupId: string }) => (
    <div data-testid="group-settings-content">settings:{groupId}</div>
  ),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/group/group-1/settings']}>
      <Routes>
        <Route path="/group/:groupId/settings" element={<GroupSettings />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GroupSettings', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGetById.mockReset();
  });

  it('loads group details and renders settings content', async () => {
    mockGetById.mockResolvedValueOnce({
      id: 'group-1',
      name: 'Team Alpha',
      status: 'active',
      memberCount: 3,
      ideaCount: 10,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    renderPage();

    expect(screen.getByText('Loading group settings...')).toBeInTheDocument();

    expect(await screen.findByTestId('group-top-nav')).toHaveTextContent('tab:settings');
    expect(screen.getByTestId('group-settings-content')).toHaveTextContent('settings:group-1');
    expect(mockGetById).toHaveBeenCalledWith('group-1');
  });

  it('shows error and navigates back to groups', async () => {
    mockGetById.mockRejectedValueOnce(new Error('Request failed'));

    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Request failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to Groups' }));

    expect(mockNavigate).toHaveBeenCalledWith('/group');
  });
});
