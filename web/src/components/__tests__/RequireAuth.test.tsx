import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RequireAuth from '../RequireAuth';

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('RequireAuth', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders nested route when authenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/group']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/group" element={<div>private-page</div>} />
          </Route>
          <Route path="/" element={<div>landing-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('private-page')).toBeInTheDocument();
  });

  it('redirects to landing when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={['/group']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/group" element={<div>private-page</div>} />
          </Route>
          <Route path="/" element={<div>landing-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('landing-page')).toBeInTheDocument();
    expect(screen.queryByText('private-page')).not.toBeInTheDocument();
  });
});
