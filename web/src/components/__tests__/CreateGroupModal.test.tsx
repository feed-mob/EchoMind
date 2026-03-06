import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CreateGroupModal from '../CreateGroupModal';

describe('CreateGroupModal', () => {
  it('does not render when closed', () => {
    render(
      <CreateGroupModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />,
    );

    expect(screen.queryByText('Create New Group')).not.toBeInTheDocument();
  });

  it('submits group name in create mode', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <CreateGroupModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />,
    );

    await user.type(screen.getByPlaceholderText('e.g. Marketing Q4 Strategy'), 'Team Next');
    await user.click(screen.getByRole('button', { name: /Create Group/ }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Team Next', logo: undefined });
  });

  it('loads initial name in edit mode and can close', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <CreateGroupModal
        isOpen
        mode="edit"
        initialName="Alpha Team"
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Edit Group')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Alpha Team');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
