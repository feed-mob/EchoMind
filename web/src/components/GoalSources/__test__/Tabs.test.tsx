import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Tabs from '../Tabs';

describe('Tabs', () => {
  const tabs = [
    { id: 'detail', label: 'Detail' },
    { id: 'sources', label: 'Sources' },
  ];

  it('renders all tabs', () => {
    render(<Tabs tabs={tabs} activeTab="sources" onChange={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'Detail' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sources' })).toBeInTheDocument();
  });

  it('marks active tab with correct styling', () => {
    render(<Tabs tabs={tabs} activeTab="sources" onChange={vi.fn()} />);

    const activeTab = screen.getByRole('tab', { name: 'Sources' });
    const inactiveTab = screen.getByRole('tab', { name: 'Detail' });

    expect(activeTab).toHaveClass('text-primary', 'border-primary');
    expect(inactiveTab).not.toHaveClass('text-primary');
  });

  it('calls onChange when clicking a tab', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Tabs tabs={tabs} activeTab="sources" onChange={handleChange} />);

    await user.click(screen.getByRole('tab', { name: 'Detail' }));

    expect(handleChange).toHaveBeenCalledWith('detail');
  });
});
