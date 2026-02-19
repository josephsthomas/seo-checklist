/**
 * Task 61: ReadabilityShareView component tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockSharedData = {
  overallScore: 78,
  grade: 'B',
  gradeSummary: 'Good readability',
  pageTitle: 'Shared Page',
  sourceUrl: 'https://example.com/shared',
  categoryScores: {
    contentStructure: { score: 75 },
    contentClarity: { score: 80 },
    technicalAccessibility: { score: 77 },
    metadataSchema: { score: 72 },
    aiSignals: { score: 86 },
  },
  recommendations: [
    { id: 'rec-1', title: 'Fix headings', priority: 'high', group: 'structural' },
  ],
  analyzedAt: '2025-06-01T00:00:00Z',
};

vi.mock('../../../hooks/useReadabilityShare', () => ({
  useReadabilityShare: () => ({
    sharedAnalysis: mockSharedData,
    isLoading: false,
    error: null,
    loadSharedAnalysis: vi.fn(),
  }),
}));

vi.mock('../../../hooks/useReadabilityExport', () => ({
  useReadabilityExport: () => ({
    exportPDF: vi.fn().mockResolvedValue(undefined),
    isExporting: false,
  }),
}));

import ReadabilityShareView from '../ReadabilityShareView';

function renderShareView(token = 'test-token') {
  return render(
    <MemoryRouter initialEntries={[`/shared/readability/${token}`]}>
      <Routes>
        <Route path="/shared/readability/:token" element={<ReadabilityShareView />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ReadabilityShareView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders shared analysis score', () => {
    renderShareView();
    expect(screen.getByText(/78/)).toBeInTheDocument();
  });

  it('renders page title', () => {
    renderShareView();
    expect(screen.getByText(/shared page/i)).toBeInTheDocument();
  });

  it('renders category scores', () => {
    renderShareView();
    expect(screen.getByText(/content structure/i)).toBeInTheDocument();
    expect(screen.getByText(/content clarity/i)).toBeInTheDocument();
  });

  it('renders recommendations (Task 18)', () => {
    renderShareView();
    expect(screen.getByText(/fix headings/i)).toBeInTheDocument();
  });

  it('renders download PDF button', () => {
    renderShareView();
    expect(screen.getByText(/download|pdf/i)).toBeInTheDocument();
  });

  it('renders branding/tool name', () => {
    renderShareView();
    expect(screen.getByText(/ai readability/i)).toBeInTheDocument();
  });
});
