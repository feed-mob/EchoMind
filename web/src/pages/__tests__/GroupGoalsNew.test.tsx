import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GroupGoalsNew from '../GroupGoalsNew';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/group/group-1/goals/new']}>
      <Routes>
        <Route path="/group/:groupId/goals/new" element={<GroupGoalsNew />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('GroupGoalsNew', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders page title and description', () => {
    renderPage();

    // Use getAllByText since the goal title appears in both sidebar and header
    const goalTitles = screen.getAllByText('Quarterly Growth Goal');
    expect(goalTitles.length).toBeGreaterThan(0);

    // Description should be unique to the header
    expect(screen.getByText(/Expand market reach by 15%/)).toBeInTheDocument();
  });

  it('renders ACTIVE GOAL badge', () => {
    renderPage();

    expect(screen.getByText('ACTIVE GOAL')).toBeInTheDocument();
  });

  it('renders Edit Goal button', () => {
    renderPage();

    expect(screen.getByRole('button', { name: /edit goal/i })).toBeInTheDocument();
  });

  it('renders tab navigation with Detail and Sources', () => {
    renderPage();

    expect(screen.getByRole('tab', { name: 'Detail' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sources' })).toBeInTheDocument();
  });

  it('renders Sources tab as active by default', () => {
    renderPage();

    const sourcesTab = screen.getByRole('tab', { name: 'Sources' });
    expect(sourcesTab).toHaveClass('text-primary', 'border-primary');
  });

  it('renders Information Sources section', () => {
    renderPage();

    expect(screen.getByText('Information Sources')).toBeInTheDocument();
  });

  it('renders New Source button', () => {
    renderPage();

    // Find the New Source button (not the Add New Source placeholder)
    const buttons = screen.getAllByRole('button');
    const newSourceButton = buttons.find(btn =>
      btn.textContent?.includes('New Source') && !btn.textContent?.includes('Add New')
    );
    expect(newSourceButton).toBeDefined();
  });

  it('renders source cards', () => {
    renderPage();

    expect(screen.getByText('Market Analysis 2024')).toBeInTheDocument();
    expect(screen.getByText('Q4 Performance Report')).toBeInTheDocument();
    expect(screen.getByText('Stakeholder Interview Notes')).toBeInTheDocument();
  });

  it('renders Add New Source placeholder', () => {
    renderPage();

    expect(screen.getByText('Add New Source')).toBeInTheDocument();
  });

  it('switches to Detail tab when clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    const detailTab = screen.getByRole('tab', { name: 'Detail' });
    await user.click(detailTab);

    expect(detailTab).toHaveClass('text-primary', 'border-primary');
  });

  it('renders My Goals sidebar with goal list', () => {
    renderPage();

    expect(screen.getByText('My Goals')).toBeInTheDocument();

    // Get all elements with these texts (they appear in both sidebar and header)
    const goalTitles = screen.getAllByText('Quarterly Growth Goal');
    expect(goalTitles.length).toBeGreaterThan(0);

    const productLaunchItems = screen.getAllByText('Product Launch Q3');
    expect(productLaunchItems.length).toBeGreaterThan(0);
  });

  it('renders goal status indicators', () => {
    renderPage();

    // Check for status indicators (colored dots)
    const statusIndicators = document.querySelectorAll('.size-2.rounded-full');
    expect(statusIndicators.length).toBeGreaterThan(0);
  });
});
