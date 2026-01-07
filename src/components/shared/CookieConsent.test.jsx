import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CookieConsent, { useCookieConsent } from './CookieConsent';
import { renderHook } from '@testing-library/react';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  })
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

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('rendering', () => {
    it('renders banner when no consent stored', () => {
      renderWithRouter(<CookieConsent />);
      expect(screen.getByText('Cookie & Privacy Settings')).toBeInTheDocument();
    });

    it('renders accept all button', () => {
      renderWithRouter(<CookieConsent />);
      expect(screen.getByText('Accept All')).toBeInTheDocument();
    });

    it('renders customize button', () => {
      renderWithRouter(<CookieConsent />);
      expect(screen.getByText('Customize')).toBeInTheDocument();
    });

    it('renders essential only button', () => {
      renderWithRouter(<CookieConsent />);
      expect(screen.getByText('Essential Only')).toBeInTheDocument();
    });

    it('renders privacy policy link', () => {
      renderWithRouter(<CookieConsent />);
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });

    it('renders close button', () => {
      renderWithRouter(<CookieConsent />);
      expect(screen.getByLabelText(/Close cookie banner/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('shows settings panel when Customize is clicked', () => {
      renderWithRouter(<CookieConsent />);

      fireEvent.click(screen.getByText('Customize'));

      expect(screen.getByText('Essential Cookies')).toBeInTheDocument();
      expect(screen.getByText('Functional Cookies')).toBeInTheDocument();
      expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
    });

    it('shows Save Preferences button when settings are open', () => {
      renderWithRouter(<CookieConsent />);

      fireEvent.click(screen.getByText('Customize'));

      expect(screen.getByText('Save Preferences')).toBeInTheDocument();
    });

    it('hides banner after Accept All is clicked', () => {
      renderWithRouter(<CookieConsent />);

      fireEvent.click(screen.getByText('Accept All'));

      expect(screen.queryByText('Cookie & Privacy Settings')).not.toBeInTheDocument();
    });

    it('hides banner after Essential Only is clicked', () => {
      renderWithRouter(<CookieConsent />);

      fireEvent.click(screen.getByText('Essential Only'));

      expect(screen.queryByText('Cookie & Privacy Settings')).not.toBeInTheDocument();
    });

    it('hides banner when X button is clicked', () => {
      renderWithRouter(<CookieConsent />);

      fireEvent.click(screen.getByLabelText(/Close cookie banner/i));

      expect(screen.queryByText('Cookie & Privacy Settings')).not.toBeInTheDocument();
    });

    it('allows toggling functional cookies', () => {
      renderWithRouter(<CookieConsent />);

      fireEvent.click(screen.getByText('Customize'));

      // Should have 2 switches (functional and analytics)
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBe(2);
    });
  });

  describe('persistence', () => {
    it('does not render banner if consent already stored', () => {
      // Set consent in localStorage before render
      localStorageMock.store['cookie-consent'] = JSON.stringify({
        version: '1.0',
        preferences: { essential: true, analytics: false, functional: true },
        timestamp: new Date().toISOString()
      });

      renderWithRouter(<CookieConsent />);

      expect(screen.queryByText('Cookie & Privacy Settings')).not.toBeInTheDocument();
    });
  });
});

describe('useCookieConsent hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('returns hasConsent false when no consent stored', () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.hasConsent).toBe(false);
  });

  it('returns correct preferences when consent is stored', () => {
    localStorageMock.store['cookie-consent'] = JSON.stringify({
      version: '1.0',
      preferences: { essential: true, analytics: true, functional: false },
      timestamp: new Date().toISOString()
    });

    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.hasConsent).toBe(true);
    expect(result.current.analytics).toBe(true);
    expect(result.current.functional).toBe(false);
    expect(result.current.essential).toBe(true);
  });

  it('returns hasConsent false for outdated version', () => {
    localStorageMock.store['cookie-consent'] = JSON.stringify({
      version: '0.9', // Outdated version
      preferences: { essential: true, analytics: true, functional: true },
      timestamp: new Date().toISOString()
    });

    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.hasConsent).toBe(false);
  });
});
