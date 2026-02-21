/**
 * Task 55: ReadabilityDashboard component tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock Firebase before any component imports
vi.mock('../../../lib/firebase', () => ({
  db: {},
  storage: {},
  auth: {},
}));

// Mock lazy-loaded components
vi.mock('../ReadabilityCategoryChart', () => ({
  default: (props) => <div data-testid="category-chart">{JSON.stringify(props.categoryScores)}</div>,
}));
vi.mock('../ReadabilityLLMPreview', () => ({
  default: () => <div data-testid="llm-preview">LLM Preview</div>,
}));
vi.mock('../ReadabilityCheckItem', () => ({
  default: ({ check }) => <div data-testid="check-item">{check.id}</div>,
}));
vi.mock('../ReadabilityScoreCard', () => ({
  default: (props) => <div data-testid="score-card">Score: {props.score}</div>,
}));
vi.mock('../ReadabilityRecommendations', () => ({
  default: () => <div data-testid="recommendations">Recs</div>,
}));
vi.mock('../ReadabilityCrossToolLinks', () => ({
  default: () => <div data-testid="cross-tool-links">Links</div>,
}));
vi.mock('../../../hooks/useReadabilityExport', () => ({
  useReadabilityExport: () => ({
    exportJSON: vi.fn(),
    exportCSV: vi.fn(),
    exportPDF: vi.fn(),
    isExporting: false,
  }),
}));
vi.mock('../../../hooks/useReadabilityShare', () => ({
  useReadabilityShare: () => ({
    shareAnalysis: vi.fn(),
    isSharing: false,
  }),
}));

import ReadabilityDashboard from '../ReadabilityDashboard';

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

const mockAnalysis = {
  id: 'test-123',
  overallScore: 82,
  grade: 'B+',
  gradeSummary: 'Good readability',
  categoryScores: {
    contentStructure: { score: 80 },
    contentClarity: { score: 85 },
    technicalAccess: { score: 78 },
    metadataSchema: { score: 82 },
    aiSignals: { score: 84 },
  },
  checkResults: [
    { id: 'CS-01', status: 'pass', title: 'H1 Present', severity: 'critical', category: 'contentStructure' },
    { id: 'CS-02', status: 'fail', title: 'Heading Hierarchy', severity: 'high', category: 'contentStructure' },
  ],
  recommendations: [{ id: 'rec-1', title: 'Fix headings', priority: 'high', group: 'structural' }],
  llmExtractions: { claude: { mainContent: 'test' } },
  aiAssessment: null,
  sourceUrl: 'https://example.com',
  pageTitle: 'Test Page',
  wordCount: 1500,
  analyzedAt: '2025-06-01T00:00:00Z',
  issueSummary: { critical: 0, high: 1, medium: 2, low: 1 },
};

describe('ReadabilityDashboard', () => {
  const defaultProps = {
    analysis: mockAnalysis,
    onBack: vi.fn(),
    onReanalyze: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the score card', () => {
    renderWithRouter(<ReadabilityDashboard {...defaultProps} />);
    expect(screen.getByTestId('score-card')).toBeInTheDocument();
    expect(screen.getByTestId('score-card')).toHaveTextContent('82');
  });

  it('renders the back button', () => {
    renderWithRouter(<ReadabilityDashboard {...defaultProps} />);
    const backBtn = screen.getByRole('button', { name: /back|new analysis/i });
    expect(backBtn).toBeInTheDocument();
  });

  it('calls onBack when back button clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ReadabilityDashboard {...defaultProps} />);
    const backBtn = screen.getByRole('button', { name: /back|new analysis/i });
    await user.click(backBtn);
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('renders category chart', () => {
    renderWithRouter(<ReadabilityDashboard {...defaultProps} />);
    expect(screen.getByTestId('category-chart')).toBeInTheDocument();
  });

  it('renders page metadata', () => {
    renderWithRouter(<ReadabilityDashboard {...defaultProps} />);
    expect(screen.getByText(/test page|example\.com/i)).toBeInTheDocument();
  });

  it('renders check items', () => {
    renderWithRouter(<ReadabilityDashboard {...defaultProps} />);
    const checks = screen.getAllByTestId('check-item');
    expect(checks.length).toBeGreaterThan(0);
  });

  it('renders export button', () => {
    renderWithRouter(<ReadabilityDashboard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });
});
