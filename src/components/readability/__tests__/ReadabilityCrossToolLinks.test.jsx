/**
 * Task 59: ReadabilityCrossToolLinks component tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReadabilityCrossToolLinks from '../ReadabilityCrossToolLinks';

function renderWithRouter(ui, { route = '/app/readability' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

describe('ReadabilityCrossToolLinks', () => {
  const mockAnalysis = {
    sourceUrl: 'https://example.com/test',
    checkResults: {
      'MS-06': { id: 'MS-06', details: 'Article schema recommended' },
    },
  };

  it('renders cross-tool link buttons', () => {
    renderWithRouter(<ReadabilityCrossToolLinks analysis={mockAnalysis} />);
    expect(screen.getByText(/run technical audit/i)).toBeInTheDocument();
    expect(screen.getByText(/generate schema markup/i)).toBeInTheDocument();
  });

  it('links include the source URL as param', () => {
    renderWithRouter(<ReadabilityCrossToolLinks analysis={mockAnalysis} />);
    const auditLink = screen.getByText(/run technical audit/i).closest('a');
    expect(auditLink).toHaveAttribute('href', expect.stringContaining('example.com'));
  });

  it('renders without analysis data', () => {
    renderWithRouter(<ReadabilityCrossToolLinks analysis={null} />);
    // Component returns null when no sourceUrl and no fromTool param
    expect(screen.queryByText(/run technical audit/i)).not.toBeInTheDocument();
  });

  it('shows back-to-tool link when navigated from another tool', () => {
    renderWithRouter(
      <ReadabilityCrossToolLinks analysis={mockAnalysis} />,
      { route: '/app/readability?from=audit' }
    );
    // Should show a "Back to Technical Audit" link
    expect(screen.getByText(/back to technical audit/i)).toBeInTheDocument();
  });
});
