/**
 * Task 58: ReadabilityPDFPreview component tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../hooks/useReadabilityExport', () => ({
  useReadabilityExport: () => ({
    exportPDF: vi.fn().mockResolvedValue(undefined),
    isExporting: false,
  }),
}));

import ReadabilityPDFPreview from '../ReadabilityPDFPreview';

const mockAnalysis = {
  id: 'test-123',
  overallScore: 85,
  grade: 'A-',
  pageTitle: 'Test Page',
  sourceUrl: 'https://example.com',
};

describe('ReadabilityPDFPreview', () => {
  const defaultProps = {
    analysis: mockAnalysis,
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('renders when open', () => {
    render(<ReadabilityPDFPreview {...defaultProps} />);
    // Should show the modal/dialog
    expect(screen.getByText(/pdf|report|preview/i)).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<ReadabilityPDFPreview {...defaultProps} />);
    const closeBtn = screen.getByRole('button', { name: /close/i });
    expect(closeBtn).toBeInTheDocument();
  });

  it('calls onClose when close clicked', async () => {
    const user = userEvent.setup();
    render(<ReadabilityPDFPreview {...defaultProps} />);
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('renders toggle switches for sections', () => {
    render(<ReadabilityPDFPreview {...defaultProps} />);
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThan(0);
  });

  it('renders download button', () => {
    render(<ReadabilityPDFPreview {...defaultProps} />);
    expect(screen.getByRole('button', { name: /download|generate/i })).toBeInTheDocument();
  });
});
