import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AddSourceButton from '../AddSourceButton';

describe('AddSourceButton', () => {
  it('renders with correct text and icon', () => {
    render(<AddSourceButton onClick={vi.fn()} />);

    expect(screen.getByText('Add New Source')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<AddSourceButton onClick={handleClick} />);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct styling classes', () => {
    render(<AddSourceButton onClick={vi.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'border-2',
      'border-dashed',
      'border-slate-200',
      'rounded-xl',
      'group',
      'cursor-pointer',
      'hover:border-primary/50'
    );
  });
});
