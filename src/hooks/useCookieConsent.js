import { useState, useEffect } from 'react';
import { getStorageItem } from '../utils/storageHelpers';

const CONSENT_KEY = 'cookie-consent';
const CONSENT_VERSION = '1.0';

/**
 * Hook to check cookie consent status
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    const stored = getStorageItem(CONSENT_KEY, null);
    if (stored && stored.version === CONSENT_VERSION) {
      setConsent(stored.preferences);
    }
  }, []);

  return {
    hasConsent: consent !== null,
    analytics: consent?.analytics || false,
    functional: consent?.functional || false,
    essential: true // Always true
  };
}

export default useCookieConsent;
