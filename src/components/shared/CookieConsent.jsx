import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { getStorageItem, setStorageItem } from '../../utils/storageHelpers';

// Re-export the hook from hooks folder for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useCookieConsent } from '../../hooks/useCookieConsent';

const CONSENT_KEY = 'cookie-consent';
const CONSENT_VERSION = '1.0';

/**
 * Cookie Consent Banner
 *
 * Displays a GDPR/CCPA compliant cookie consent banner.
 * Stores user preference in localStorage.
 */
export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    functional: true
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = getStorageItem(CONSENT_KEY, null);
    if (!consent || consent.version !== CONSENT_VERSION) {
      // Show banner if no consent or outdated version
      setShowBanner(true);
    } else {
      setPreferences(consent.preferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences = {
      essential: true,
      analytics: true,
      functional: true
    };
    saveConsent(newPreferences);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
  };

  const handleRejectNonEssential = () => {
    const newPreferences = {
      essential: true,
      analytics: false,
      functional: false
    };
    saveConsent(newPreferences);
  };

  const saveConsent = (prefs) => {
    const consent = {
      version: CONSENT_VERSION,
      preferences: prefs,
      timestamp: new Date().toISOString()
    };
    setStorageItem(CONSENT_KEY, consent);
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-charcoal-200 overflow-hidden">
        {/* Main Banner */}
        <div className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Cookie className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-charcoal-900 mb-2">
                Cookie & Privacy Settings
              </h2>
              <p className="text-charcoal-600 text-sm mb-4">
                We use cookies and similar technologies to provide essential functionality, analyze usage,
                and improve your experience. You can customize your preferences below.
              </p>

              {/* Cookie Settings Panel */}
              {showSettings && (
                <div className="mb-4 space-y-3 p-4 bg-charcoal-50 rounded-lg">
                  {/* Essential Cookies */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-charcoal-900 text-sm">Essential Cookies</p>
                      <p className="text-charcoal-500 text-xs">Required for the site to function (login, security)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-charcoal-500">Always on</span>
                      <div className="w-10 h-5 bg-primary-500 rounded-full flex items-center justify-end px-0.5">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-charcoal-900 text-sm">Functional Cookies</p>
                      <p className="text-charcoal-500 text-xs">Remembers your preferences and settings</p>
                    </div>
                    <button
                      onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                      className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                        preferences.functional ? 'bg-primary-500 justify-end' : 'bg-charcoal-300 justify-start'
                      }`}
                      role="switch"
                      aria-checked={preferences.functional}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-charcoal-900 text-sm">Analytics Cookies</p>
                      <p className="text-charcoal-500 text-xs">Helps us understand how you use the site</p>
                    </div>
                    <button
                      onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                      className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                        preferences.analytics ? 'bg-primary-500 justify-end' : 'bg-charcoal-300 justify-start'
                      }`}
                      role="switch"
                      aria-checked={preferences.analytics}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  Accept All
                </button>

                {showSettings ? (
                  <button
                    onClick={handleAcceptSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors text-sm font-medium"
                  >
                    Save Preferences
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors text-sm font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Customize
                  </button>
                )}

                <button
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 text-charcoal-600 hover:text-charcoal-900 text-sm"
                >
                  Essential Only
                </button>
              </div>

              {/* Privacy Link */}
              <p className="text-xs text-charcoal-500 mt-3">
                Learn more in our{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Close button - for dismissing without choice (defaults to essential only) */}
            <button
              onClick={handleRejectNonEssential}
              className="p-1 text-charcoal-400 hover:text-charcoal-600 transition-colors"
              aria-label="Close cookie banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
