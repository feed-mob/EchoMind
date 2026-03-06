import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal', () => {
  it('renders content and handles confirm/cancel actions', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmModal
        isOpen
        title="Delete"
        message="Confirm delete?"
        confirmText="Delete"
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByText('Confirm delete?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape when not loading', () => {
    const onClose = vi.fn();

    render(
      <ConfirmModal isOpen message="Escape test" onClose={onClose} onConfirm={vi.fn()} />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close via Escape or overlay when loading', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ConfirmModal isOpen message="Loading test" confirmLoading onClose={onClose} onConfirm={vi.fn()} />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    const overlay = container.querySelector('div.absolute.inset-0');
    expect(overlay).not.toBeNull();
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled();
  });
});
