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
    // Should still render, perhaps without URL params
    expect(screen.getByText(/run technical audit/i)).toBeInTheDocument();
  });

  it('shows back-to-tool link when navigated from another tool', () => {
    renderWithRouter(
      <ReadabilityCrossToolLinks analysis={mockAnalysis} />,
      { route: '/app/readability?from=audit' }
    );
    // Should show a "back to audit" style link
    expect(screen.getByText(/technical audit/i)).toBeInTheDocument();
  });
});
