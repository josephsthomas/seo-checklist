import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AIDisclaimer, { AIDisclaimerInline, AIBadge } from './AIDisclaimer';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Wrapper to provide routing context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AIDisclaimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('rendering', () => {
    it('renders the tool name', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" />);
      expect(screen.getByText(/Test Tool - AI-Powered Feature/i)).toBeInTheDocument();
    });

    it('renders the warning message', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" />);
      expect(screen.getByText(/AI can make mistakes/i)).toBeInTheDocument();
    });

    it('renders expandable details button', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" />);
      expect(screen.getByText(/Important information about AI limitations/i)).toBeInTheDocument();
    });

    it('renders dismiss button when dismissible', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" dismissible={true} />);
      expect(screen.getByLabelText(/Dismiss AI disclaimer/i)).toBeInTheDocument();
    });

    it('does not render dismiss button when not dismissible', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" dismissible={false} />);
      expect(screen.queryByLabelText(/Dismiss AI disclaimer/i)).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('expands details when clicked', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" />);

      const expandButton = screen.getByText(/Important information about AI limitations/i);
      fireEvent.click(expandButton);

      expect(screen.getByText(/What you should know:/i)).toBeInTheDocument();
      expect(screen.getByText(/AI-generated content may contain errors/i)).toBeInTheDocument();
    });

    it('collapses details when clicked again', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" />);

      const expandButton = screen.getByText(/Important information about AI limitations/i);
      fireEvent.click(expandButton);

      const collapseButton = screen.getByText(/Hide details/i);
      fireEvent.click(collapseButton);

      expect(screen.queryByText(/What you should know:/i)).not.toBeInTheDocument();
    });

    it('dismisses when dismiss button is clicked', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" dismissible={true} />);

      const dismissButton = screen.getByLabelText(/Dismiss AI disclaimer/i);
      fireEvent.click(dismissButton);

      expect(screen.queryByText(/Test Tool - AI-Powered Feature/i)).not.toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('renders compact version when compact prop is true', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" compact={true} />);
      expect(screen.getByText(/AI-generated content requires review/i)).toBeInTheDocument();
    });

    it('does not render full banner in compact mode', () => {
      renderWithRouter(<AIDisclaimer toolName="Test Tool" compact={true} />);
      expect(screen.queryByText(/Test Tool - AI-Powered Feature/i)).not.toBeInTheDocument();
    });
  });
});

describe('AIDisclaimerInline', () => {
  it('renders inline disclaimer text', () => {
    renderWithRouter(<AIDisclaimerInline />);
    expect(screen.getByText(/AI-generated - review before use/i)).toBeInTheDocument();
  });

  it('renders link to AI policy', () => {
    renderWithRouter(<AIDisclaimerInline />);
    expect(screen.getByText(/AI Policy/i)).toBeInTheDocument();
  });
});

describe('AIBadge', () => {
  it('renders AI Generated badge', () => {
    render(<AIBadge />);
    expect(screen.getByText(/AI Generated/i)).toBeInTheDocument();
  });

  it('has correct accessibility title', () => {
    render(<AIBadge />);
    expect(screen.getByTitle(/AI-generated content - review before use/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AIBadge className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
