import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AIExportConfirmation from './AIExportConfirmation';
import { useAIExportConfirmation } from '../../hooks/useAIExportConfirmation';
import { renderHook, act } from '@testing-library/react';

// Wrapper to provide routing context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AIExportConfirmation', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when closed', () => {
      const { container } = renderWithRouter(
        <AIExportConfirmation
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('renders modal when open', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders warning message about AI', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      expect(screen.getByText(/AI-generated content may contain errors/i)).toBeInTheDocument();
    });

    it('renders three acknowledgment checkboxes', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText(/I have reviewed the AI-generated/i)).toBeInTheDocument();
      expect(screen.getByText(/I understand that AI can make mistakes/i)).toBeInTheDocument();
      expect(screen.getByText(/I accept responsibility for verifying/i)).toBeInTheDocument();
    });

    it('shows correct export type label for copy', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          exportType="copy"
        />
      );
      expect(screen.getByText(/Before You Copy/i)).toBeInTheDocument();
    });

    it('shows correct export type label for download', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          exportType="download"
        />
      );
      expect(screen.getByText(/Before You Download/i)).toBeInTheDocument();
    });

    it('shows content type in description', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType="metadata"
        />
      );
      expect(screen.getByText(/Please confirm you've reviewed the metadata/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClose when cancel button clicked', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop clicked', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      // Click on backdrop (the overlay behind the modal)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when X button clicked', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      fireEvent.click(screen.getByLabelText(/Close dialog/i));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('export button is disabled until all acknowledgments are checked', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          exportType="copy"
        />
      );

      // Find all buttons and filter to find the export one
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(btn => btn.textContent.includes('Copy'));
      expect(exportButton).toBeDisabled();
    });

    it('enables export button when all acknowledgments are checked', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          exportType="copy"
        />
      );

      // Click on the text of each acknowledgment (they are buttons styled as checkboxes)
      fireEvent.click(screen.getByText(/I have reviewed the AI-generated/i).closest('button'));
      fireEvent.click(screen.getByText(/I understand that AI can make mistakes/i).closest('button'));
      fireEvent.click(screen.getByText(/I accept responsibility for verifying/i).closest('button'));

      // Find the export button
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(btn => btn.textContent.includes('Copy'));
      expect(exportButton).not.toBeDisabled();
    });

    it('calls onConfirm when all checked and export clicked', () => {
      renderWithRouter(
        <AIExportConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          exportType="download"
        />
      );

      // Click on each acknowledgment
      fireEvent.click(screen.getByText(/I have reviewed the AI-generated/i).closest('button'));
      fireEvent.click(screen.getByText(/I understand that AI can make mistakes/i).closest('button'));
      fireEvent.click(screen.getByText(/I accept responsibility for verifying/i).closest('button'));

      // Click export button
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(btn => btn.textContent.includes('Download'));
      fireEvent.click(exportButton);

      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });
});

describe('useAIExportConfirmation hook', () => {
  it('initializes with isOpen false', () => {
    const { result } = renderHook(() => useAIExportConfirmation());
    expect(result.current.isOpen).toBe(false);
  });

  it('opens modal when requestExport is called', () => {
    const { result } = renderHook(() => useAIExportConfirmation());

    act(() => {
      result.current.requestExport(() => {}, 'copy', 'test content');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.exportType).toBe('copy');
    expect(result.current.contentType).toBe('test content');
  });

  it('closes modal when handleClose is called', () => {
    const { result } = renderHook(() => useAIExportConfirmation());

    act(() => {
      result.current.requestExport(() => {}, 'copy', 'test');
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('executes pending action and closes modal on handleConfirm', () => {
    const mockAction = vi.fn();
    const { result } = renderHook(() => useAIExportConfirmation());

    act(() => {
      result.current.requestExport(mockAction, 'download', 'test');
    });

    act(() => {
      result.current.handleConfirm();
    });

    expect(mockAction).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });
});
