/**
 * Task 57: ReadabilityTrendSparkline component tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReadabilityTrendSparkline from '../ReadabilityTrendSparkline';

describe('ReadabilityTrendSparkline', () => {
  const trendData = [
    { date: '2025-01-01', score: 65 },
    { date: '2025-02-01', score: 72 },
    { date: '2025-03-01', score: 78 },
    { date: '2025-04-01', score: 82 },
  ];

  it('renders SVG sparkline with valid data', () => {
    render(<ReadabilityTrendSparkline data={trendData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders nothing with less than 2 data points', () => {
    const { container } = render(<ReadabilityTrendSparkline data={[{ date: '2025-01-01', score: 65 }]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing with empty data', () => {
    const { container } = render(<ReadabilityTrendSparkline data={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('has accessible aria-label describing trend', () => {
    render(<ReadabilityTrendSparkline data={trendData} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('65'));
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('82'));
  });

  it('renders data points as circles', () => {
    const { container } = render(<ReadabilityTrendSparkline data={trendData} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(trendData.length);
  });

  it('renders screen reader data table', () => {
    render(<ReadabilityTrendSparkline data={trendData} />);
    expect(screen.getByText('Score Trend Data')).toBeInTheDocument();
    expect(screen.getByText('65/100')).toBeInTheDocument();
    expect(screen.getByText('82/100')).toBeInTheDocument();
  });

  it('renders with custom dimensions', () => {
    const { container } = render(<ReadabilityTrendSparkline data={trendData} width={300} height={80} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '300');
    expect(svg).toHaveAttribute('height', '80');
  });
});
