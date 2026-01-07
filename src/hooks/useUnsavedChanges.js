import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to warn users about unsaved changes before leaving
 *
 * Features:
 * - Browser beforeunload warning for page refresh/close
 * - Tracks dirty state for forms/editors
 * - Can be used with React Router for navigation warnings
 *
 * @param {boolean} initialDirty - Initial dirty state
 * @returns {Object} - { isDirty, setDirty, markClean, markDirty }
 */
export function useUnsavedChanges(initialDirty = false) {
  const [isDirty, setIsDirty] = useState(initialDirty);

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        // Standard way to trigger the browser's "are you sure" dialog
        e.preventDefault();
        // For older browsers
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const markDirty = useCallback(() => setIsDirty(true), []);
  const markClean = useCallback(() => setIsDirty(false), []);
  const setDirty = useCallback((value) => setIsDirty(value), []);

  return {
    isDirty,
    setDirty,
    markClean,
    markDirty
  };
}

/**
 * Hook for tracking form changes with auto-dirty detection
 *
 * @param {Object} initialValues - Initial form values
 * @returns {Object} - { values, setValues, isDirty, resetForm, handleChange }
 */
export function useFormWithUnsavedChanges(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [originalValues, setOriginalValues] = useState(initialValues);
  const [isDirty, setIsDirty] = useState(false);

  // Check if values have changed from original
  useEffect(() => {
    const hasChanges = JSON.stringify(values) !== JSON.stringify(originalValues);
    setIsDirty(hasChanges);
  }, [values, originalValues]);

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback((newValues = null) => {
    const resetTo = newValues || originalValues;
    setValues(resetTo);
    setOriginalValues(resetTo);
    setIsDirty(false);
  }, [originalValues]);

  const updateOriginal = useCallback((newOriginal) => {
    setOriginalValues(newOriginal);
  }, []);

  return {
    values,
    setValues,
    isDirty,
    resetForm,
    handleChange,
    updateOriginal
  };
}

/**
 * Session data warning component props
 * This hook provides the state management for showing warnings about session data
 */
export function useSessionDataWarning() {
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [hasUnsavedWork, setHasUnsavedWork] = useState(false);

  // Check localStorage for previous session data on mount
  useEffect(() => {
    const sessionData = localStorage.getItem('session-data-warning-shown');
    if (sessionData) {
      setHasShownWarning(true);
    }
  }, []);

  const markWarningShown = useCallback(() => {
    setHasShownWarning(true);
    localStorage.setItem('session-data-warning-shown', 'true');
  }, []);

  const setUnsavedWork = useCallback((hasWork) => {
    setHasUnsavedWork(hasWork);
  }, []);

  return {
    hasShownWarning,
    hasUnsavedWork,
    markWarningShown,
    setUnsavedWork,
    shouldShowWarning: !hasShownWarning && hasUnsavedWork
  };
}

export default useUnsavedChanges;
