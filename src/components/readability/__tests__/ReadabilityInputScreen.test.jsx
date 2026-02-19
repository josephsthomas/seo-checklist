import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../../lib/readability/utils/urlValidation', () => ({
  validateReadabilityUrl: vi.fn((url) => {
    if (!url || url.length < 10) return { valid: false, reason: 'Invalid URL' };
    if (url.startsWith('https://')) return { valid: true, url };
    return { valid: false, reason: 'Must use HTTPS' };
  }),
}));

vi.mock('../../../lib/readability/utils/gradeMapper', () => ({
  getGrade: vi.fn((score) => ({
    grade: score >= 90 ? 'A' : score >= 70 ? 'C' : 'F',
    summary: 'Test summary',
  })),
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

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ReadabilityInputScreen', () => {
  const defaultProps = {
    onAnalyzeUrl: vi.fn(),
    onAnalyzeHtml: vi.fn(),
    onAnalyzePaste: vi.fn(),
    isAnalyzing: false,
    error: null,
    recentAnalyses: [],
    onViewAnalysis: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue('true'); // Skip onboarding
  });

  it('renders three input tabs', () => {
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} />);
    expect(screen.getByRole('tab', { name: /url/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /upload/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /paste/i })).toBeInTheDocument();
  });

  it('defaults to URL tab', () => {
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} />);
    expect(screen.getByRole('tab', { name: /url/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows URL input on URL tab', () => {
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} />);
    expect(screen.getByLabelText(/page url/i)).toBeInTheDocument();
  });

  it('switches to paste tab on click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} />);
    await user.click(screen.getByRole('tab', { name: /paste/i }));
    expect(screen.getByRole('tab', { name: /paste/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/html content/i)).toBeInTheDocument();
  });

  it('shows empty history state when no analyses', () => {
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} recentAnalyses={[]} />);
    expect(screen.getByText(/no analyses yet/i)).toBeInTheDocument();
  });

  it('shows recent analyses when provided', () => {
    const analyses = [
      { id: '1', sourceUrl: 'https://example.com', overallScore: 85, inputMethod: 'url', createdAt: '2025-01-01T00:00:00Z' },
    ];
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} recentAnalyses={analyses} />);
    expect(screen.getByText(/recent analyses/i)).toBeInTheDocument();
    expect(screen.getByText(/example\.com/i)).toBeInTheDocument();
  });

  it('shows helper text for URL tab', () => {
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} />);
    expect(screen.getByText(/enter a public url/i)).toBeInTheDocument();
  });

  it('shows onboarding callout for first-time users', () => {
    localStorage.getItem.mockReturnValue(null);
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} />);
    expect(screen.getByText(/welcome to the ai readability checker/i)).toBeInTheDocument();
  });

  it('disables analyze button when URL is invalid', () => {
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} />);
    const button = screen.getByRole('button', { name: /analyze/i });
    expect(button).toBeDisabled();
  });

  it('disables inputs when analyzing', () => {
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} isAnalyzing={true} />);
    expect(screen.getByLabelText(/page url/i)).toBeDisabled();
  });

  it('prefills URL from prop', () => {
    renderWithRouter(<ReadabilityInputScreen {...defaultProps} prefillUrl="https://example.com" />);
    expect(screen.getByLabelText(/page url/i)).toHaveValue('https://example.com');
  });
});
