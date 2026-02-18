/**
 * useReadabilitySettings Hook
 *
 * Manages user preferences for the AI Readability Checker.
 * Stored in Firestore readability-settings collection (BRD 04 §3.2).
 *
 * Settings include PDF export defaults (report title, client logo, toggle sections).
 */

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
  // PDF export defaults
  pdfReportTitle: 'AI Readability Analysis Report',
  pdfClientName: '',
  pdfClientLogo: null,
  pdfIncludeLLMSummary: true,
  pdfIncludeGEOBrief: true,
  pdfIncludeMethodology: true,
  pdfIncludeCodeSnippets: true,

  // Share defaults
  defaultShareExpiry: 30, // days

  // Display preferences
  defaultLLMsEnabled: ['claude', 'openai', 'gemini'],
  defaultRecommendationView: 'all', // all | quick-wins | structural | content | technical
  defaultAudienceView: 'all' // all | content | development
};

/**
 * Hook for reading/writing readability-settings per user
 */
export function useReadabilitySettings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings on mount
  useEffect(() => {
    if (!currentUser) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    async function loadSettings() {
      try {
        const settingsRef = doc(db, 'readability-settings', currentUser.uid);
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsSnap.data() });
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (err) {
        console.error('Failed to load readability settings:', err);
        setError(err.message);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [currentUser]);

  // Save settings
  const updateSettings = useCallback(async (updates) => {
    if (!currentUser) return;

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    try {
      const settingsRef = doc(db, 'readability-settings', currentUser.uid);
      await setDoc(settingsRef, {
        ...newSettings,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error('Failed to save readability settings:', err);
      setError(err.message);
    }
  }, [currentUser, settings]);

  // Reset to defaults
  const resetSettings = useCallback(async () => {
    await updateSettings(DEFAULT_SETTINGS);
  }, [updateSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    DEFAULT_SETTINGS
  };
}

export { DEFAULT_SETTINGS };
export default useReadabilitySettings;
