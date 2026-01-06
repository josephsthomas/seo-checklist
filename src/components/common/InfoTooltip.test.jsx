import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InfoTooltip from './InfoTooltip';

// Mock the tooltips module
vi.mock('../../lib/tooltips', () => ({
  getTooltip: vi.fn((key) => {
    const tooltips = {
      'test.tooltip': 'This is a test tooltip',
      'schedule.frequency': 'Choose how often this report should be generated',
    };
    return tooltips[key] || '';
  }),
}));

describe('InfoTooltip Component', () => {
  it('should render the help icon', () => {
    render(<InfoTooltip tipKey="test.tooltip" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should not render if tooltip text is empty', () => {
    const { container } = render(<InfoTooltip tipKey="nonexistent.key" />);
    expect(container.firstChild).toBeNull();
  });

  it('should show tooltip on mouse enter', () => {
    render(<InfoTooltip tipKey="test.tooltip" />);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button.parentElement);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('This is a test tooltip');
  });

  it('should hide tooltip on mouse leave', () => {
    render(<InfoTooltip tipKey="test.tooltip" />);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button.parentElement);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(button.parentElement);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should show tooltip on focus', () => {
    render(<InfoTooltip tipKey="test.tooltip" />);
    const button = screen.getByRole('button');

    fireEvent.focus(button.parentElement);

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('should hide tooltip on blur', () => {
    render(<InfoTooltip tipKey="test.tooltip" />);
    const button = screen.getByRole('button');

    fireEvent.focus(button.parentElement);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(button.parentElement);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should use direct text prop instead of tipKey', () => {
    render(<InfoTooltip text="Direct tooltip text" />);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button.parentElement);

    expect(screen.getByRole('tooltip')).toHaveTextContent('Direct tooltip text');
  });

  it('should have accessible aria-label', () => {
    render(<InfoTooltip tipKey="test.tooltip" />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-label', 'This is a test tooltip');
  });

  it('should apply custom className', () => {
    render(<InfoTooltip tipKey="test.tooltip" className="custom-class" />);
    const wrapper = screen.getByRole('button').parentElement;

    expect(wrapper).toHaveClass('custom-class');
  });
});
