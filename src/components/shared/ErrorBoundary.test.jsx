import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary, { ToolErrorBoundary, PageErrorBoundary } from './ErrorBoundary';

// Simple component that throws
function ProblemChild() {
  throw new Error('Test error');
}

// Simple component that works
function GoodChild() {
  return <div>Good content</div>;
}

describe('ErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Good content')).toBeInTheDocument();
  });

  it('should show error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should show custom message when provided', () => {
    render(
      <ErrorBoundary message="Custom error message">
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should show full page error for page variant', () => {
    render(
      <ErrorBoundary variant="page">
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('should show Go Back for tool variant', () => {
    render(
      <ErrorBoundary variant="tool">
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });
});

describe('ToolErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when no error', () => {
    render(
      <ToolErrorBoundary toolName="Test Tool">
        <GoodChild />
      </ToolErrorBoundary>
    );

    expect(screen.getByText('Good content')).toBeInTheDocument();
  });

  it('should show tool name in error message', () => {
    render(
      <ToolErrorBoundary toolName="Test Tool">
        <ProblemChild />
      </ToolErrorBoundary>
    );

    expect(screen.getByText('Test Tool Error')).toBeInTheDocument();
  });
});

describe('PageErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should show page-level error UI', () => {
    render(
      <PageErrorBoundary>
        <ProblemChild />
      </PageErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });
});
