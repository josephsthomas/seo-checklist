import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FeedbackForm from './FeedbackForm';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
  storage: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'test-id' })),
  serverTimestamp: vi.fn(() => new Date())
}));

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/screenshot.png'))
}));

// Mock Auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user-id', email: 'test@example.com' },
    userProfile: { name: 'Test User' }
  })
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('FeedbackForm', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when closed', () => {
      const { container } = renderWithRouter(
        <FeedbackForm isOpen={false} onClose={mockOnClose} />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('renders modal when open', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders form title', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      // The title is in the heading
      expect(screen.getByRole('heading', { name: /Submit Feedback/i })).toBeInTheDocument();
    });

    it('renders all feedback type options', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      expect(screen.getByText('Bug Report')).toBeInTheDocument();
      expect(screen.getByText('Enhancement')).toBeInTheDocument();
      expect(screen.getByText('General Feedback')).toBeInTheDocument();
    });

    it('renders title and description inputs', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      expect(screen.getByRole('button', { name: /Submit Feedback/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('renders system information section', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      expect(screen.getByText('System Information')).toBeInTheDocument();
    });

    it('renders screenshot upload area', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      expect(screen.getByText(/Click to upload screenshot/i)).toBeInTheDocument();
    });
  });

  describe('feedback type selection', () => {
    it('defaults to bug report', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      // Bug report specific fields should be visible
      expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Steps to Reproduce/i)).toBeInTheDocument();
    });

    it('shows bug-specific fields when Bug Report is selected', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      fireEvent.click(screen.getByText('Bug Report'));

      expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Steps to Reproduce/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Expected Behavior/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Actual Behavior/i)).toBeInTheDocument();
    });

    it('shows enhancement-specific fields when Enhancement is selected', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      fireEvent.click(screen.getByText('Enhancement'));

      expect(screen.getByLabelText(/Use Case/i)).toBeInTheDocument();
      // Bug fields should not be visible
      expect(screen.queryByLabelText(/Priority/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Steps to Reproduce/i)).not.toBeInTheDocument();
    });

    it('hides type-specific fields for General Feedback', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      fireEvent.click(screen.getByText('General Feedback'));

      expect(screen.queryByLabelText(/Priority/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Use Case/i)).not.toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('calls onClose when close button is clicked', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      fireEvent.click(screen.getByLabelText(/Close feedback form/i));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when Cancel button is clicked', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const backdrop = document.querySelector('[aria-hidden="true"]');
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('updates title input value', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const titleInput = screen.getByLabelText(/Title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Bug Title' } });
      expect(titleInput.value).toBe('Test Bug Title');
    });

    it('updates description textarea value', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const descInput = screen.getByLabelText(/Description/i);
      fireEvent.change(descInput, { target: { value: 'Test description' } });
      expect(descInput.value).toBe('Test description');
    });

    it('shows email input when allow contact is checked', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(screen.getByPlaceholderText(/Your email address/i)).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('submit button is disabled when title is empty', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const descInput = screen.getByLabelText(/Description/i);
      fireEvent.change(descInput, { target: { value: 'Some description' } });

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      expect(submitButton).toBeDisabled();
    });

    it('submit button is disabled when description is empty', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const titleInput = screen.getByLabelText(/Title/i);
      fireEvent.change(titleInput, { target: { value: 'Some title' } });

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      expect(submitButton).toBeDisabled();
    });

    it('submit button is enabled when both title and description are filled', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const titleInput = screen.getByLabelText(/Title/i);
      const descInput = screen.getByLabelText(/Description/i);

      fireEvent.change(titleInput, { target: { value: 'Some title' } });
      fireEvent.change(descInput, { target: { value: 'Some description' } });

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('form submission', () => {
    it('shows success state after submission', async () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const titleInput = screen.getByLabelText(/Title/i);
      const descInput = screen.getByLabelText(/Description/i);

      fireEvent.change(titleInput, { target: { value: 'Test Bug' } });
      fireEvent.change(descInput, { target: { value: 'Bug description' } });

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
      });
    });
  });

  describe('priority selection for bugs', () => {
    it('renders all priority options', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const prioritySelect = screen.getByLabelText(/Priority/i);
      expect(prioritySelect).toBeInTheDocument();

      // Check that options exist
      expect(screen.getByText(/Low - Minor issue/i)).toBeInTheDocument();
    });

    it('allows changing priority', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );

      const prioritySelect = screen.getByLabelText(/Priority/i);
      fireEvent.change(prioritySelect, { target: { value: 'critical' } });
      expect(prioritySelect.value).toBe('critical');
    });
  });

  describe('accessibility', () => {
    it('has proper dialog role', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has proper form labels', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    it('close button has accessible label', () => {
      renderWithRouter(
        <FeedbackForm isOpen={true} onClose={mockOnClose} />
      );
      expect(screen.getByLabelText(/Close feedback form/i)).toBeInTheDocument();
    });
  });
});
