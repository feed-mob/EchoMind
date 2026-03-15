import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SourceCard from '../SourceCard';

describe('SourceCard', () => {
  const baseSource = {
    id: 'source-1',
    title: 'Test Source',
    description: 'Test description for the source.',
    updatedAt: 'Updated 2h ago',
  };

  it('renders AI Generated source correctly', () => {
    render(
      <SourceCard
        {...baseSource}
        type="ai"
        aiType="AI Generated"
        onView={() => {}}
      />
    );

    expect(screen.getByText('Test Source')).toBeInTheDocument();
    expect(screen.getByText('Test description for the source.')).toBeInTheDocument();
    expect(screen.getByText('AI Generated')).toBeInTheDocument();
    expect(screen.getByText('Updated 2h ago')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
  });

  it('renders PDF source correctly', () => {
    render(
      <SourceCard
        {...baseSource}
        type="pdf"
        fileType="PDF"
        uploadedAt="Uploaded Dec 12"
        onOpen={() => {}}
      />
    );

    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Uploaded Dec 12')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('renders Manual Entry source correctly', () => {
    render(
      <SourceCard
        {...baseSource}
        type="manual"
        entryType="Manual Entry"
        modifiedAt="Modified Jan 05"
        onEdit={() => {}}
      />
    );

    expect(screen.getByText('Manual Entry')).toBeInTheDocument();
    expect(screen.getByText('Modified Jan 05')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders AI Insights source correctly', () => {
    render(
      <SourceCard
        {...baseSource}
        type="ai"
        aiType="AI Insights"
        onAnalyze={() => {}}
      />
    );

    expect(screen.getByText('AI Insights')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
  });

  it('calls onView when View button is clicked', async () => {
    const handleView = vi.fn();
    const user = userEvent.setup();

    render(
      <SourceCard
        {...baseSource}
        type="ai"
        aiType="AI Generated"
        onView={handleView}
      />
    );

    await user.click(screen.getByRole('button', { name: 'View' }));
    expect(handleView).toHaveBeenCalledTimes(1);
  });

  it('is visible on hover by default', () => {
    render(
      <SourceCard
        {...baseSource}
        type="ai"
        aiType="AI Generated"
        onView={() => {}}
      />
    );

    const button = screen.getByRole('button', { name: 'View' });
    expect(button).toHaveClass('opacity-0', 'group-hover:opacity-100');
  });
});
