import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Landing from '../Landing';

const { mockNavigate, mockUseAuth } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../components', () => ({
  Header: () => <div>header</div>,
  Hero: () => <div>hero</div>,
  Features: () => <div>features</div>,
  Footer: () => <div>footer</div>,
}));

describe('Landing', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseAuth.mockReset();
  });

  it('renders landing sections when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByText('header')).toBeInTheDocument();
    expect(screen.getByText('hero')).toBeInTheDocument();
    expect(screen.getByText('features')).toBeInTheDocument();
    expect(screen.getByText('footer')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects authenticated user to groups page', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith('/group', { replace: true });
  });
});
