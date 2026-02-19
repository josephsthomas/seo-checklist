import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReadabilityProcessingScreen from '../ReadabilityProcessingScreen';

describe('ReadabilityProcessingScreen', () => {
  const defaultProps = {
    progress: { stage: 'extracting', progress: 20, message: 'Extracting content...', substages: { claude: 'pending', openai: 'pending', gemini: 'pending' } },
    partialResults: null,
    onCancel: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('renders the progress bar', () => {
    render(<ReadabilityProcessingScreen {...defaultProps} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20');
  });

  it('displays progress percentage', () => {
    render(<ReadabilityProcessingScreen {...defaultProps} />);
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('renders stage checklist', () => {
    render(<ReadabilityProcessingScreen {...defaultProps} />);
    expect(screen.getByText(/fetching page content/i)).toBeInTheDocument();
    // "Extracting content" appears in both the stage label and the sr-only aria-live region
    expect(screen.getAllByText(/extracting content/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/analyzing with ai/i)).toBeInTheDocument();
    expect(screen.getByText(/calculating scores/i)).toBeInTheDocument();
    expect(screen.getByText(/finalizing results/i)).toBeInTheDocument();
  });

  it('shows cancel button', () => {
    render(<ReadabilityProcessingScreen {...defaultProps} />);
    expect(screen.getByText(/cancel analysis/i)).toBeInTheDocument();
  });

  it('shows cancel confirmation dialog on click', async () => {
    const user = userEvent.setup();
    render(<ReadabilityProcessingScreen {...defaultProps} />);
    await user.click(screen.getByText(/cancel analysis/i));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByText(/yes, cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/continue/i)).toBeInTheDocument();
  });

  it('calls onCancel when confirmed', async () => {
    const user = userEvent.setup();
    render(<ReadabilityProcessingScreen {...defaultProps} />);
    await user.click(screen.getByText(/cancel analysis/i));
    await user.click(screen.getByText(/yes, cancel/i));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('dismisses cancel dialog on Continue', async () => {
    const user = userEvent.setup();
    render(<ReadabilityProcessingScreen {...defaultProps} />);
    await user.click(screen.getByText(/cancel analysis/i));
    await user.click(screen.getByText(/continue/i));
    expect(screen.getByText(/cancel analysis/i)).toBeInTheDocument();
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('displays did you know factoid', () => {
    render(<ReadabilityProcessingScreen {...defaultProps} />);
    expect(screen.getByText(/did you know/i)).toBeInTheDocument();
  });

  it('shows partial results preview when available', () => {
    render(
      <ReadabilityProcessingScreen
        {...defaultProps}
        partialResults={{
          pageTitle: 'Test Page Title',
          pageDescription: 'A test description',
          wordCount: 1500,
          language: 'en',
        }}
      />
    );
    expect(screen.getByText('Test Page Title')).toBeInTheDocument();
    expect(screen.getByText('A test description')).toBeInTheDocument();
    expect(screen.getByText(/1,500 words/)).toBeInTheDocument();
  });

  it('shows screen reader announcements', () => {
    render(<ReadabilityProcessingScreen {...defaultProps} />);
    const announcer = screen.getByText('Extracting content...');
    expect(announcer).toBeInTheDocument();
  });
});
