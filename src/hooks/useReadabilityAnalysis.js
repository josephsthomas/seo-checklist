import { useState, useCallback, useRef, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  limit as firestoreLimit
} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { validateReadabilityUrl } from '../lib/readability/utils/urlValidation';
import { runFullAnalysis, truncateForFirestore, estimateDocumentSize } from '../lib/readability/aggregator';
import toast from 'react-hot-toast';

/**
 * Analysis states
 */
const STATES = {
  IDLE: 'idle',
  FETCHING: 'fetching',
  EXTRACTING: 'extracting',
  ANALYZING: 'analyzing',
  SCORING: 'scoring',
  COMPLETE: 'complete',
  ERROR: 'error'
};

/**
 * Storage limits per role (Q7 promoted to MVP)
 */
const STORAGE_LIMITS = {
  admin: 500,
  project_manager: 250,
  seo_specialist: 100,
  developer: 100,
  content_writer: 100
};

/**
 * Get storage limit for a given role
 */
function getStorageLimit(role) {
  return STORAGE_LIMITS[role] || 100;
}

/**
 * Fetch URL content via the proxy
 * BRD: FR-1.1.3 — server-side proxy with redirects, timeout, gzip
 */
async function fetchUrlViaProxy(url, signal, authToken) {
  const proxyUrl = import.meta.env.VITE_AI_PROXY_URL;
  if (!proxyUrl) {
    throw new Error('AI proxy URL not configured. Set VITE_AI_PROXY_URL in your environment.');
  }

  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const response = await fetch(`${proxyUrl}/api/fetch-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      url,
      options: {
        renderJS: false,
        timeout: 30000,
        followRedirects: true,
        maxRedirects: 5
      }
    }),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const status = response.status;

    if (status === 404) throw new Error(`Page not found (404) at "${url}".`);
    if (status === 403) throw new Error(`Access denied by "${new URL(url).hostname}".`);
    if (status === 429) throw new Error('Rate limit reached. Please try again in a few minutes.');
    if (status === 401) throw new Error('Session expired. Please log in again.');
    if (status >= 500) throw new Error('The server returned an error. Try again later.');
    throw new Error(errorData.message || `Failed to fetch URL (status ${status})`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch URL content');
  }

  return data.data;
}

/**
 * Validate an uploaded HTML file
 * BRD: FR-1.2 — .html/.htm, max 10MB, single file, valid HTML
 */
function validateHtmlFile(file) {
  if (!file) {
    return { valid: false, reason: 'No file provided' };
  }

  const ext = file.name.split('.').pop().toLowerCase();
  if (!['html', 'htm'].includes(ext)) {
    return { valid: false, reason: 'Only .html and .htm files are supported.' };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, reason: 'File exceeds the 10MB limit.' };
  }

  if (file.size === 0) {
    return { valid: false, reason: 'The uploaded file is empty.' };
  }

  return { valid: true };
}

/**
 * Validate pasted HTML content
 * BRD: FR-1.3 — min 100 chars, max 2MB
 */
function validatePastedHtml(html) {
  if (!html || typeof html !== 'string') {
    return { valid: false, reason: 'No HTML content provided' };
  }

  if (html.length < 100) {
    return { valid: false, reason: 'Please paste at least 100 characters of HTML.' };
  }

  const sizeBytes = new Blob([html]).size;
  if (sizeBytes > 2 * 1024 * 1024) {
    return { valid: false, reason: 'Content exceeds the 2MB limit.' };
  }

  return { valid: true };
}

/**
 * Check if HTML content is valid (has basic HTML structure)
 * BRD: FR-1.2.2 — detect html/head/body
 */
function isValidHtml(html) {
  const lower = html.toLowerCase();
  return lower.includes('<html') || lower.includes('<body') || lower.includes('<head');
}

/**
 * Auto-archive oldest analyses when storage limit is exceeded
 * BRD: FR-5.1.2, Q7 — tier-based storage limits
 */
async function enforceStorageLimit(userId, role) {
  const storageLimit = getStorageLimit(role);
  const analysesRef = collection(db, 'readability-analyses');
  const countQuery = query(
    analysesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(countQuery);
  const totalCount = snapshot.size;

  if (totalCount >= storageLimit) {
    // Delete oldest analyses to make room
    const toDelete = totalCount - storageLimit + 1; // Make room for new one
    const docsToDelete = snapshot.docs.slice(-toDelete);

    for (const docSnap of docsToDelete) {
      await deleteDoc(doc(db, 'readability-analyses', docSnap.id));
    }
  }
}

/**
 * Find previous analysis of same URL for trend tracking
 * BRD: US-2.5.2, FR-5.2.2 — re-analysis delta calculation
 */
async function findPreviousAnalysis(userId, sourceUrl) {
  if (!sourceUrl) return null;

  const analysesRef = collection(db, 'readability-analyses');
  const q = query(
    analysesRef,
    where('userId', '==', userId),
    where('sourceUrl', '==', sourceUrl),
    orderBy('createdAt', 'desc'),
    firestoreLimit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const prevDoc = snapshot.docs[0];
  return {
    id: prevDoc.id,
    overallScore: prevDoc.data().overallScore
  };
}

/**
 * useReadabilityAnalysis Hook
 *
 * Main analysis orchestration — manages the entire analysis lifecycle.
 * Handles URL fetch, HTML file upload, raw HTML paste, progress tracking,
 * cancellation, Firestore persistence, and storage limit enforcement.
 *
 * BRD References: US-2.1.1, US-2.1.2, US-2.1.3, FR-2.1, FR-2.2, FR-2.3, FR-3.1
 */
export function useReadabilityAnalysis() {
  const { currentUser, userProfile } = useAuth();
  const userRole = userProfile?.role || 'content_writer';
  const [state, setState] = useState(STATES.IDLE);
  const [progress, setProgress] = useState({
    stage: null,
    progress: 0,
    message: '',
    substages: {
      claude: 'pending',
      openai: 'pending',
      gemini: 'pending'
    }
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [partialResults, setPartialResults] = useState(null);
  const abortControllerRef = useRef(null);

  // Cleanup AbortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Progress callback for the analysis pipeline
   */
  const handleProgress = useCallback((progressData) => {
    setProgress(prev => ({
      ...prev,
      stage: progressData.stage,
      progress: progressData.progress,
      message: progressData.message,
      ...(progressData.substages ? { substages: progressData.substages } : {})
    }));

    // Map pipeline stages to hook states
    const stageMap = {
      fetching: STATES.FETCHING,
      extracting: STATES.EXTRACTING,
      analyzing: STATES.ANALYZING,
      scoring: STATES.SCORING,
      recommendations: STATES.SCORING,
      finalizing: STATES.SCORING,
      complete: STATES.COMPLETE
    };

    if (stageMap[progressData.stage]) {
      setState(stageMap[progressData.stage]);
    }
  }, []);

  /**
   * Core analysis runner — shared by all input methods
   */
  const runAnalysis = useCallback(async (htmlContent, options = {}) => {
    if (!currentUser) {
      throw new Error('You must be logged in to run an analysis.');
    }

    // Get fresh Firebase auth token for proxy requests
    let authToken = null;
    try {
      authToken = await currentUser.getIdToken();
    } catch (tokenErr) {
      console.warn('Could not get auth token, proceeding without:', tokenErr);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(STATES.EXTRACTING);
    setError(null);
    setResult(null);
    setPartialResults(null);
    setProgress({
      stage: 'extracting',
      progress: 10,
      message: 'Starting analysis...',
      substages: { claude: 'pending', openai: 'pending', gemini: 'pending' }
    });

    try {
      // Run the full analysis pipeline
      const analysisResult = await runFullAnalysis(htmlContent, {
        sourceUrl: options.sourceUrl || null,
        inputMethod: options.inputMethod || 'url',
        filename: options.filename || null,
        signal: controller.signal,
        onProgress: handleProgress,
        authToken
      });

      if (controller.signal.aborted) return;

      // Set partial results for UI preview after extraction
      setPartialResults({
        pageTitle: analysisResult.pageTitle,
        pageDescription: analysisResult.pageDescription,
        language: analysisResult.language,
        wordCount: analysisResult.wordCount
      });

      // Enforce storage limits before saving
      await enforceStorageLimit(currentUser.uid, userRole);

      // Check for previous analysis of same URL (trend tracking)
      let previousAnalysisId = null;
      let scoreDelta = null;

      if (options.sourceUrl) {
        const prev = await findPreviousAnalysis(currentUser.uid, options.sourceUrl);
        if (prev) {
          previousAnalysisId = prev.id;
          scoreDelta = analysisResult.overallScore - prev.overallScore;
        }
      }

      // Truncate for Firestore 1MB limit
      const { document: firestoreDoc, overflow } = truncateForFirestore({
        ...analysisResult,
        userId: currentUser.uid,
        previousAnalysisId,
        scoreDelta,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (overflow) {
        console.warn('Analysis document truncated for Firestore storage');
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'readability-analyses'), firestoreDoc);

      // Store HTML snapshot in Firebase Storage (Task 35)
      try {
        if (htmlContent && storage) {
          const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
          const storageRef = ref(storage, `readability-snapshots/${currentUser.uid}/${docRef.id}.html`);
          await uploadBytes(storageRef, htmlBlob);
        }
      } catch (storageErr) {
        console.warn('Could not store HTML snapshot:', storageErr);
        // Non-fatal: continue without snapshot
      }

      const savedResult = {
        id: docRef.id,
        ...analysisResult,
        previousAnalysisId,
        scoreDelta
      };

      setResult(savedResult);
      setState(STATES.COMPLETE);
      setProgress(prev => ({ ...prev, stage: 'complete', progress: 100, message: 'Analysis complete!' }));

      return savedResult;
    } catch (err) {
      if (err.name === 'AbortError') {
        setState(STATES.IDLE);
        setProgress({ stage: null, progress: 0, message: '', substages: { claude: 'pending', openai: 'pending', gemini: 'pending' } });
        return;
      }

      setState(STATES.ERROR);
      setError(err.message || 'An unexpected error occurred during analysis.');
      throw err;
    }
  }, [currentUser, userRole, handleProgress]);

  /**
   * Analyze a URL
   * BRD: US-2.1.1, FR-1.1
   */
  const analyzeUrl = useCallback(async (url) => {
    // Validate URL
    const validation = validateReadabilityUrl(url);
    if (!validation.valid) {
      setError(validation.reason);
      setState(STATES.ERROR);
      throw new Error(validation.reason);
    }

    const validatedUrl = validation.url;

    setState(STATES.FETCHING);
    setProgress({
      stage: 'fetching',
      progress: 5,
      message: 'Fetching page content...',
      substages: { claude: 'pending', openai: 'pending', gemini: 'pending' }
    });

    try {
      // Get auth token for proxy
      let authToken = null;
      try { authToken = await currentUser.getIdToken(); } catch (_) { /* proceed without */ }

      // Fetch via proxy
      const fetchResult = await fetchUrlViaProxy(validatedUrl, abortControllerRef.current?.signal, authToken);

      if (!fetchResult.html || fetchResult.html.length < 50) {
        throw new Error('The fetched page contains very little content. Try uploading the HTML directly.');
      }

      // Check content type
      const contentType = fetchResult.headers?.['content-type'] || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
        throw new Error(`This URL returned ${contentType.split(';')[0]} content, not HTML.`);
      }

      // Run analysis
      return await runAnalysis(fetchResult.html, {
        sourceUrl: fetchResult.finalUrl || validatedUrl,
        inputMethod: 'url'
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setState(STATES.IDLE);
        return;
      }

      // Map network errors to user-friendly messages
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError(`Could not reach "${new URL(validatedUrl).hostname}". Check the URL and try again.`);
      } else if (err.message.includes('timeout') || err.message.includes('AbortError')) {
        setError("The server didn't respond in time. Try uploading the HTML directly.");
      } else {
        setError(err.message);
      }
      setState(STATES.ERROR);
      throw err;
    }
  }, [runAnalysis]);

  /**
   * Analyze an uploaded HTML file
   * BRD: US-2.1.2, FR-1.2
   */
  const analyzeHtml = useCallback(async (file) => {
    // Validate file
    const validation = validateHtmlFile(file);
    if (!validation.valid) {
      setError(validation.reason);
      setState(STATES.ERROR);
      throw new Error(validation.reason);
    }

    setState(STATES.EXTRACTING);
    setProgress({
      stage: 'extracting',
      progress: 10,
      message: 'Reading uploaded file...',
      substages: { claude: 'pending', openai: 'pending', gemini: 'pending' }
    });

    try {
      const htmlContent = await file.text();

      if (!isValidHtml(htmlContent)) {
        throw new Error("This file doesn't appear to contain valid HTML.");
      }

      return await runAnalysis(htmlContent, {
        inputMethod: 'upload',
        filename: file.name
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setState(STATES.ERROR);
      }
      throw err;
    }
  }, [runAnalysis]);

  /**
   * Analyze pasted HTML content
   * BRD: US-2.1.3, FR-1.3
   */
  const analyzePaste = useCallback(async (html) => {
    // Validate paste content
    const validation = validatePastedHtml(html);
    if (!validation.valid) {
      setError(validation.reason);
      setState(STATES.ERROR);
      throw new Error(validation.reason);
    }

    setState(STATES.EXTRACTING);
    setProgress({
      stage: 'extracting',
      progress: 10,
      message: 'Processing pasted HTML...',
      substages: { claude: 'pending', openai: 'pending', gemini: 'pending' }
    });

    try {
      return await runAnalysis(html, {
        inputMethod: 'paste'
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setState(STATES.ERROR);
      }
      throw err;
    }
  }, [runAnalysis]);

  /**
   * Cancel in-progress analysis
   * BRD: Processing Screen — cancel with confirmation, no partial save
   */
  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(STATES.IDLE);
    setProgress({
      stage: null,
      progress: 0,
      message: '',
      substages: { claude: 'pending', openai: 'pending', gemini: 'pending' }
    });
    setError(null);
    setPartialResults(null);
    toast('Analysis cancelled', { icon: '🚫' });
  }, []);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(STATES.IDLE);
    setProgress({
      stage: null,
      progress: 0,
      message: '',
      substages: { claude: 'pending', openai: 'pending', gemini: 'pending' }
    });
    setResult(null);
    setError(null);
    setPartialResults(null);
  }, []);

  return {
    // State
    state,
    progress,
    result,
    error,
    partialResults,

    // Computed
    isIdle: state === STATES.IDLE,
    isAnalyzing: [STATES.FETCHING, STATES.EXTRACTING, STATES.ANALYZING, STATES.SCORING].includes(state),
    isComplete: state === STATES.COMPLETE,
    isError: state === STATES.ERROR,

    // Actions
    analyzeUrl,
    analyzeHtml,
    analyzePaste,
    cancelAnalysis,
    reset,

    // Constants
    STATES
  };
}

export { STATES as ANALYSIS_STATES };
export default useReadabilityAnalysis;
