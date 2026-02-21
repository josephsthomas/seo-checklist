import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Default settings for readability checker
 */
const DEFAULT_SETTINGS = {
  enabledLLMs: ['claude', 'openai', 'gemini'],
  defaultExportFormat: 'pdf',
  autoExpandFailedChecks: true,
  showQuickWins: true,
  defaultShareExpiryDays: 30,
  preferredIndustry: '',
  notifyOnCompletion: true,
};

/**
 * useReadabilitySettings — Read/write user preferences for the readability checker
 * Persisted in Firestore at readability-settings/{userId}
 *
 * BRD Reference: FR-8.3 (User preferences persistence)
 */
export function useReadabilitySettings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings on mount
  useEffect(() => {
    if (!currentUser) {
      setSettings(DEFAULT_SETTINGS);
      setIsLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'readability-settings', currentUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
        }
      } catch (err) {
        console.warn('Could not load readability settings:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [currentUser]);

  // Save settings
  const updateSettings = useCallback(async (updates) => {
    if (!currentUser) return;

    let newSettings;
    let previousSettings;
    setSettings(prev => {
      previousSettings = prev;
      newSettings = { ...prev, ...updates };
      return newSettings;
    });

    try {
      const docRef = doc(db, 'readability-settings', currentUser.uid);
      await setDoc(docRef, {
        ...newSettings,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Could not save readability settings:', err);
      setError(err.message);
      // Revert to previous settings on failure
      if (previousSettings) {
        setSettings(previousSettings);
      }
      toast.error('Failed to save settings. Please try again.');
    }
  }, [currentUser]);

  // Reset to defaults
  const resetSettings = useCallback(async () => {
    await updateSettings(DEFAULT_SETTINGS);
  }, [updateSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
  };
}

export default useReadabilitySettings;
