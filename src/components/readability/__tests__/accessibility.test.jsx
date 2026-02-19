/**
 * Tasks 62-63: Accessibility and keyboard navigation tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../../lib/readability/utils/urlValidation', () => ({
  validateReadabilityUrl: vi.fn((url) => {
    if (url?.startsWith('https://')) return { valid: true, url };
    return { valid: false, reason: 'Invalid' };
  }),
}));
vi.mock('../../../lib/readability/utils/gradeMapper', () => ({
  getGrade: vi.fn(() => ({ grade: 'B', summary: 'Good' })),
  getScoreColor: vi.fn(() => 'teal'),
}));
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(() => ({
    getRootProps: () => ({ role: 'button' }),
    getInputProps: () => ({}),
    isDragActive: false,
    isDragReject: false,
  })),
}));

import ReadabilityInputScreen from '../ReadabilityInputScreen';
import ReadabilityProcessingScreen from '../ReadabilityProcessingScreen';
import ReadabilityScoreCard from '../ReadabilityScoreCard';
import ReadabilityCheckItem from '../ReadabilityCheckItem';

describe('Accessibility (a11y)', () => {
  describe('ReadabilityInputScreen', () => {
    const props = {
      onAnalyzeUrl: vi.fn(),
      onAnalyzeHtml: vi.fn(),
      onAnalyzePaste: vi.fn(),
      recentAnalyses: [],
    };

    it('has proper tablist role for input tabs', () => {
      render(<MemoryRouter><ReadabilityInputScreen {...props} /></MemoryRouter>);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('tabs have proper aria-selected attributes', () => {
      render(<MemoryRouter><ReadabilityInputScreen {...props} /></MemoryRouter>);
      const tabs = screen.getAllByRole('tab');
      const selected = tabs.filter(t => t.getAttribute('aria-selected') === 'true');
      expect(selected).toHaveLength(1);
    });

    it('URL input has aria-required', () => {
      render(<MemoryRouter><ReadabilityInputScreen {...props} /></MemoryRouter>);
      expect(screen.getByLabelText(/page url/i)).toHaveAttribute('aria-required', 'true');
    });

    it('tab panels have proper roles', () => {
      render(<MemoryRouter><ReadabilityInputScreen {...props} /></MemoryRouter>);
      const panel = screen.getByRole('tabpanel');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('ReadabilityProcessingScreen', () => {
    it('progress bar has proper ARIA attributes', () => {
      render(<ReadabilityProcessingScreen progress={{ progress: 50, stage: 'analyzing', message: 'Analyzing...' }} onCancel={vi.fn()} />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '50');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('has live region for screen reader announcements', () => {
      render(<ReadabilityProcessingScreen progress={{ progress: 50, stage: 'analyzing', message: 'Analyzing...' }} onCancel={vi.fn()} />);
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('ReadabilityScoreCard', () => {
    it('score gauge has role=meter with ARIA attributes', () => {
      render(<ReadabilityScoreCard score={85} grade="A-" gradeSummary="Great" citationWorthiness={70} />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-valuenow', '85');
      expect(meter).toHaveAttribute('aria-valuemin', '0');
      expect(meter).toHaveAttribute('aria-valuemax', '100');
    });

    it('has screen reader data table', () => {
      render(<ReadabilityScoreCard score={85} grade="A-" gradeSummary="Great" citationWorthiness={70} />);
      expect(screen.getByText('Score Details')).toBeInTheDocument();
    });
  });

  describe('ReadabilityCheckItem', () => {
    const failCheck = {
      id: 'CS-01',
      title: 'Missing H1',
      status: 'fail',
      severity: 'critical',
      description: 'No H1 found',
      details: 'Add a single H1 tag',
      recommendation: 'Add an H1 heading',
    };

    it('expandable items have aria-expanded', () => {
      const { container } = render(<ReadabilityCheckItem check={failCheck} />);
      const expandable = container.querySelector('[aria-expanded]');
      expect(expandable).not.toBeNull();
      expect(expandable).toHaveAttribute('aria-expanded');
    });

    it('expandable items have aria-controls', () => {
      const { container } = render(<ReadabilityCheckItem check={failCheck} />);
      const expandable = container.querySelector('[aria-controls]');
      expect(expandable).not.toBeNull();
      expect(expandable).toHaveAttribute('aria-controls');
    });

    it('pass items are not expandable', () => {
      const passCheck = { id: 'CS-02', title: 'H1 Present', status: 'pass' };
      render(<ReadabilityCheckItem check={passCheck} />);
      const buttons = screen.queryAllByRole('button');
      // Should only have the copy button, not the expander
      const expanders = buttons.filter(b => b.getAttribute('aria-expanded') !== null);
      expect(expanders).toHaveLength(0);
    });
  });
});

describe('Keyboard Navigation', () => {
  describe('Tab navigation in InputScreen', () => {
    const props = {
      onAnalyzeUrl: vi.fn(),
      onAnalyzeHtml: vi.fn(),
      onAnalyzePaste: vi.fn(),
      recentAnalyses: [],
    };

    it('arrow keys switch between tabs', async () => {
      const user = userEvent.setup();
      render(<MemoryRouter><ReadabilityInputScreen {...props} /></MemoryRouter>);
      const urlTab = screen.getByRole('tab', { name: /url/i });
      urlTab.focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /upload/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('arrow left wraps from first to last', async () => {
      const user = userEvent.setup();
      render(<MemoryRouter><ReadabilityInputScreen {...props} /></MemoryRouter>);
      const urlTab = screen.getByRole('tab', { name: /url/i });
      urlTab.focus();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: /paste/i })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('CheckItem keyboard interaction', () => {
    const failCheck = {
      id: 'CS-01',
      title: 'Test Check',
      status: 'fail',
      severity: 'high',
      description: 'Desc',
      recommendation: 'Fix it',
    };

    it('Enter key toggles expansion', async () => {
      const user = userEvent.setup();
      render(<ReadabilityCheckItem check={failCheck} />);
      const button = screen.getByRole('button', { expanded: false });
      button.focus();
      await user.keyboard('{Enter}');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('Space key toggles expansion', async () => {
      const user = userEvent.setup();
      render(<ReadabilityCheckItem check={failCheck} />);
      const button = screen.getByRole('button', { expanded: false });
      button.focus();
      await user.keyboard(' ');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
