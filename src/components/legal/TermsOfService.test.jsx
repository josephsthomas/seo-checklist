import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TermsOfService from './TermsOfService';

// Wrapper to provide routing context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TermsOfService', () => {
  describe('rendering', () => {
    it('renders the page title', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });

    it('renders the company name correctly', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getAllByText(/Joseph S. Thomas dba Content-Strategy.co/i).length).toBeGreaterThan(0);
    });

    it('renders intellectual property disclaimer about employers', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText(/Interpublic Group/i)).toBeInTheDocument();
      expect(screen.getByText(/Omnicom/i)).toBeInTheDocument();
    });

    it('renders AI-related warnings', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText(/AI-Powered Features Disclaimer/i)).toBeInTheDocument();
      expect(screen.getByText(/AI systems can and do make mistakes/i)).toBeInTheDocument();
    });

    it('renders limitation of liability section', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText(/Limitation of Liability/i)).toBeInTheDocument();
    });

    it('renders user responsibilities section', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText(/User Responsibilities/i)).toBeInTheDocument();
    });

    it('renders indemnification section', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText(/Indemnification/i)).toBeInTheDocument();
    });

    it('renders back to home link', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText(/Back to Home/i)).toBeInTheDocument();
    });

    it('renders related policies links', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText('Privacy & Data Policy')).toBeInTheDocument();
      expect(screen.getByText('AI Usage Policy')).toBeInTheDocument();
    });
  });

  describe('content accuracy', () => {
    it('emphasizes AI content is suggestions only', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText(/suggestions only/i)).toBeInTheDocument();
    });

    it('states user responsibility for reviewing AI content', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText(/solely responsible for reviewing/i)).toBeInTheDocument();
    });

    it('mentions AI hallucinations risk', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getAllByText(/hallucinations/i).length).toBeGreaterThan(0);
    });

    it('states no employer resources were used', () => {
      renderWithRouter(<TermsOfService />);
      expect(screen.getByText(/No tools, resources, code, frameworks, or intellectual property from any employer/i)).toBeInTheDocument();
    });
  });
});
