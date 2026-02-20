/**
 * Task 60: ReadabilityRecommendations component tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

vi.mock('../ReadabilityRecommendationCard', () => ({
  default: ({ recommendation }) => (
    <div data-testid="rec-card">{recommendation.title}</div>
  ),
}));

import ReadabilityRecommendations from '../ReadabilityRecommendations';

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

const mockRecs = [
  { id: 'rec-1', title: 'Add meta description', priority: 'critical', group: 'content', impact: 'high', effort: 'low', audience: 'all' },
  { id: 'rec-2', title: 'Fix heading hierarchy', priority: 'high', group: 'structural', impact: 'high', effort: 'moderate', audience: 'content' },
  { id: 'rec-3', title: 'Add JSON-LD schema', priority: 'medium', group: 'technical', impact: 'medium', effort: 'high', audience: 'development' },
  { id: 'rec-4', title: 'Improve readability', priority: 'low', group: 'content', impact: 'medium', effort: 'moderate', audience: 'all' },
];

describe('ReadabilityRecommendations', () => {
  it('renders all recommendation cards', () => {
    renderWithRouter(<ReadabilityRecommendations recommendations={mockRecs} />);
    const cards = screen.getAllByTestId('rec-card');
    expect(cards.length).toBe(4);
  });

  it('renders filter pills', () => {
    renderWithRouter(<ReadabilityRecommendations recommendations={mockRecs} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Quick Wins')).toBeInTheDocument();
    expect(screen.getByText('Structural')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
  });

  it('filters by group', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ReadabilityRecommendations recommendations={mockRecs} />);
    await user.click(screen.getByText('Technical'));
    const cards = screen.getAllByTestId('rec-card');
    expect(cards.length).toBe(1);
    expect(cards[0]).toHaveTextContent('Add JSON-LD schema');
  });

  it('filters quick wins (high impact + low effort)', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ReadabilityRecommendations recommendations={mockRecs} />);
    await user.click(screen.getByText('Quick Wins'));
    const cards = screen.getAllByTestId('rec-card');
    expect(cards.length).toBe(1);
    expect(cards[0]).toHaveTextContent('Add meta description');
  });

  it('renders audience toggle', () => {
    renderWithRouter(<ReadabilityRecommendations recommendations={mockRecs} />);
    expect(screen.getByText('All Teams')).toBeInTheDocument();
    expect(screen.getByText(/for content team/i)).toBeInTheDocument();
    expect(screen.getByText(/for development team/i)).toBeInTheDocument();
  });

  it('shows empty state when no matching recs', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ReadabilityRecommendations recommendations={[]} />);
    expect(screen.getByText(/no recommendations/i)).toBeInTheDocument();
  });

  it('sorts by priority (critical first)', () => {
    renderWithRouter(<ReadabilityRecommendations recommendations={mockRecs} />);
    const cards = screen.getAllByTestId('rec-card');
    expect(cards[0]).toHaveTextContent('Add meta description'); // critical
    expect(cards[1]).toHaveTextContent('Fix heading hierarchy'); // high
  });

  it('includes AI-sourced recs from aiAssessment', () => {
    const aiAssessment = {
      readabilityIssues: [
        { title: 'AI Suggestion: Improve clarity', priority: 'medium' },
      ],
    };
    renderWithRouter(<ReadabilityRecommendations recommendations={mockRecs} aiAssessment={aiAssessment} />);
    expect(screen.getByText('AI Suggestion: Improve clarity')).toBeInTheDocument();
  });

  it('shows AI recommendations note', () => {
    const aiAssessment = {
      readabilityIssues: [{ title: 'AI Suggestion', priority: 'medium' }],
    };
    renderWithRouter(<ReadabilityRecommendations recommendations={mockRecs} aiAssessment={aiAssessment} />);
    expect(screen.getByText(/ai suggested/i)).toBeInTheDocument();
  });
});
