import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SourceList from '../SourceList';
import type { Source } from '../types';

describe('SourceList', () => {
  const mockSources: Source[] = [
    {
      id: 'source-1',
      type: 'ai',
      title: 'Market Analysis 2024',
      description: 'Autonomous synthesis of current SaaS market trends.',
      aiType: 'AI Generated',
      updatedAt: 'Updated 2h ago',
    },
    {
      id: 'source-2',
      type: 'pdf',
      title: 'Q4 Performance Report',
      description: 'Internal audit of sales performance.',
      fileType: 'PDF',
      uploadedAt: 'Uploaded Dec 12',
    },
    {
      id: 'source-3',
      type: 'manual',
      title: 'Stakeholder Interview Notes',
      description: 'Direct feedback from C-level meeting.',
      entryType: 'Manual Entry',
      modifiedAt: 'Modified Jan 05',
    },
  ];

  it('renders header with title and New Source button', () => {
    render(<SourceList sources={mockSources} onAddSource={vi.fn()} />);

    expect(screen.getByText('Information Sources')).toBeInTheDocument();
    // Find the New Source button (not the Add New Source placeholder)
    const buttons = screen.getAllByRole('button');
    const newSourceButton = buttons.find(btn =>
      btn.textContent?.includes('New Source') && !btn.textContent?.includes('Add New')
    );
    expect(newSourceButton).toBeDefined();
  });

  it('renders all source cards', () => {
    render(<SourceList sources={mockSources} onAddSource={vi.fn()} />);

    expect(screen.getByText('Market Analysis 2024')).toBeInTheDocument();
    expect(screen.getByText('Q4 Performance Report')).toBeInTheDocument();
    expect(screen.getByText('Stakeholder Interview Notes')).toBeInTheDocument();
  });

  it('calls onAddSource when New Source button is clicked', async () => {
    const handleAddSource = vi.fn();
    const user = userEvent.setup();

    render(<SourceList sources={mockSources} onAddSource={handleAddSource} />);

    // Find the New Source button by looking for buttons and filtering
    const buttons = screen.getAllByRole('button');
    const newSourceButton = buttons.find(btn =>
      btn.textContent?.includes('New Source') && !btn.textContent?.includes('Add New')
    );
    expect(newSourceButton).toBeDefined();
    if (newSourceButton) {
      await user.click(newSourceButton);
    }
    expect(handleAddSource).toHaveBeenCalledTimes(1);
  });

  it('calls onAddSource when Add New Source placeholder is clicked', async () => {
    const handleAddSource = vi.fn();
    const user = userEvent.setup();

    render(<SourceList sources={mockSources} onAddSource={handleAddSource} />);

    await user.click(screen.getByText('Add New Source'));
    expect(handleAddSource).toHaveBeenCalledTimes(1);
  });

  it('renders empty list when no sources provided', () => {
    render(<SourceList sources={[]} onAddSource={vi.fn()} />);

    expect(screen.getByText('Information Sources')).toBeInTheDocument();
    expect(screen.getByText('Add New Source')).toBeInTheDocument();
  });

  it('forwards action callbacks to source cards', async () => {
    const handleView = vi.fn();
    const sources: Source[] = [
      {
        id: 'source-1',
        type: 'ai',
        title: 'Test Source',
        description: 'Test description',
        aiType: 'AI Generated',
        updatedAt: 'Updated 2h ago',
        onView: handleView,
      },
    ];

    const user = userEvent.setup();
    render(<SourceList sources={sources} onAddSource={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'View' }));
    expect(handleView).toHaveBeenCalledTimes(1);
  });
});
