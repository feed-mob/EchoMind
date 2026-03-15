import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import GoalHeader from '../GoalHeader';

describe('GoalHeader', () => {
  const defaultProps = {
    title: 'Quarterly Growth Goal',
    description: 'Expand market reach by 15% through organic channels.',
    backgroundImage: 'https://example.com/bg.jpg',
    onEdit: vi.fn(),
  };

  it('renders title and description', () => {
    render(<GoalHeader {...defaultProps} />);

    expect(screen.getByText('Quarterly Growth Goal')).toBeInTheDocument();
    expect(screen.getByText('Expand market reach by 15% through organic channels.')).toBeInTheDocument();
  });

  it('renders ACTIVE GOAL badge', () => {
    render(<GoalHeader {...defaultProps} />);

    expect(screen.getByText('ACTIVE GOAL')).toBeInTheDocument();
  });

  it('renders Edit Goal button', () => {
    render(<GoalHeader {...defaultProps} />);

    expect(screen.getByRole('button', { name: /edit goal/i })).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', async () => {
    const handleEdit = vi.fn();
    const user = userEvent.setup();

    render(<GoalHeader {...defaultProps} onEdit={handleEdit} />);

    await user.click(screen.getByRole('button', { name: /edit goal/i }));
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<GoalHeader {...defaultProps} className="custom-class" />);

    // The className is applied to the outermost div which has the background
    // Find the element by looking for the custom-class directly
    const header = document.querySelector('.custom-class');
    expect(header).not.toBeNull();
    expect(header).toHaveClass('custom-class');
  });
});
