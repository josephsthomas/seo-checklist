import { useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Generate a UUID v4 share token
 */
function generateShareToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Copy text to clipboard with fallback
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-HTTPS contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  } catch {
    return false;
  }
}

/**
 * Filter analysis data for shared view
 * BRD: Shared view shows score, categories, LLM coverage — NOT full extraction, history, personal data
 */
function filterForSharedView(data) {
  // Build LLM coverage summary (no full extraction text)
  const llmCoverage = {};
  if (data.llmExtractions) {
    for (const [llmKey, extraction] of Object.entries(data.llmExtractions)) {
      if (!extraction) continue;
      llmCoverage[llmKey] = {
        model: extraction.model,
        status: extraction.status,
        usefulnessScore: extraction.usefulnessScore,
        usefulnessExplanation: extraction.usefulnessExplanation,
        extractedTitle: extraction.extractedTitle,
        extractedDescription: extraction.extractedDescription,
        primaryTopic: extraction.primaryTopic,
        processingTimeMs: extraction.processingTimeMs,
        entityCount: extraction.entities?.length || 0,
        headingCount: extraction.headings?.length || 0
        // Intentionally omitting: mainContent, entities list, unprocessableContent
      };
    }
  }

  return {
    // Score data
    overallScore: data.overallScore,
    grade: data.grade,
    gradeColor: data.gradeColor,
    gradeLabel: data.gradeLabel,
    gradeSummary: data.gradeSummary,
    categoryScores: data.categoryScores,
    issueSummary: data.issueSummary,

    // Page metadata (non-personal)
    pageTitle: data.pageTitle,
    pageDescription: data.pageDescription,
    sourceUrl: data.sourceUrl,
    language: data.language,
    wordCount: data.wordCount,
    analyzedAt: data.analyzedAt,

    // Check results (for category breakdown)
    checkResults: data.checkResults,

    // LLM coverage summary (filtered — no full text)
    llmCoverage,

    // AI visibility summary
    aiVisibilitySummary: data.aiAssessment?.contentSummary || data.gradeSummary || null,
    citationWorthiness: data.aiAssessment?.citationWorthiness || null,

    // Recommendations (public)
    recommendations: data.recommendations,

    // Sharing metadata
    shareExpiresAt: data.shareExpiry,
    isShared: data.isShared,

    // Versioning
    scoringVersion: data.scoringVersion,
    promptVersion: data.promptVersion
  };
}

/**
 * useReadabilityShare Hook
 *
 * Share link generation, revocation, and shared view loading.
 * Manages the shareToken, isShared, and shareExpiresAt fields on analysis documents.
 *
 * BRD References: US-2.6.3, Shared View Requirements, E-OPS-13
 */
export function useReadabilityShare() {
  const { currentUser } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [sharedAnalysis, setSharedAnalysis] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState(null);

  /**
   * Create a share link for an analysis
   * BRD: US-2.6.3 — UUID token, configurable expiry, auto-copy to clipboard
   *
   * @param {string} analysisId - Firestore document ID
   * @param {Object} options - { expiryDays: 7|30|90|null }
   * @returns {Object} { shareUrl, shareToken, expiresAt }
   */
  const createShareLink = useCallback(async (analysisId, options = {}) => {
    if (!analysisId || !currentUser) {
      toast.error('Unable to create share link');
      return null;
    }

    setIsSharing(true);

    try {
      const { expiryDays = 30 } = options;
      const shareToken = generateShareToken();

      // Calculate expiry
      let shareExpiresAt = null;
      if (expiryDays !== null) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
        shareExpiresAt = Timestamp.fromDate(expiryDate);
      }

      // Update Firestore document
      const docRef = doc(db, 'readability-analyses', analysisId);
      await updateDoc(docRef, {
        shareToken,
        isShared: true,
        shareExpiry: shareExpiresAt
      });

      // Build share URL
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/shared/readability/${shareToken}`;

      // Auto-copy to clipboard
      const copied = await copyToClipboard(shareUrl);

      if (copied) {
        toast.success('Share link copied to clipboard');
      } else {
        toast.success('Share link created');
      }

      return {
        shareUrl,
        shareToken,
        expiresAt: shareExpiresAt?.toDate() || null
      };
    } catch (err) {
      console.error('Failed to create share link:', err);
      toast.error(err.message || 'Failed to create share link');
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, [currentUser]);

  /**
   * Revoke a share link
   * BRD: US-2.6.3 — user can disable sharing from detail view
   */
  const revokeShare = useCallback(async (analysisId) => {
    if (!analysisId || !currentUser) return;

    setIsSharing(true);

    try {
      const docRef = doc(db, 'readability-analyses', analysisId);
      await updateDoc(docRef, {
        isShared: false,
        shareToken: null,
        shareExpiry: null
      });

      toast.success('Share link revoked');
    } catch (err) {
      console.error('Failed to revoke share link:', err);
      toast.error(err.message || 'Failed to revoke share link');
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, [currentUser]);

  /**
   * Load a shared analysis by share token (public — no auth required)
   * BRD: Shared View Requirements — validates token exists + not expired
   * Returns filtered data (no full extraction text, history, personal data)
   */
  const loadSharedAnalysis = useCallback(async (shareToken) => {
    if (!shareToken) {
      setShareError('Invalid share link');
      return null;
    }

    setShareLoading(true);
    setShareError(null);
    setSharedAnalysis(null);

    try {
      const analysesRef = collection(db, 'readability-analyses');
      const q = query(
        analysesRef,
        where('shareToken', '==', shareToken),
        where('isShared', '==', true)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // BRD: "Error for expired: no info leakage about whether token existed"
        // Same message for expired, not found, or never existed
        setShareError('This link has expired or is no longer available.');
        return null;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      // Check expiry
      if (data.shareExpiry) {
        const expiryDate = data.shareExpiry.toDate ? data.shareExpiry.toDate() : new Date(data.shareExpiry);
        if (expiryDate < new Date()) {
          setShareError('This link has expired or is no longer available.');
          return null;
        }
      }

      // Filter data for public view
      const filtered = filterForSharedView(data);
      setSharedAnalysis(filtered);
      return filtered;
    } catch (err) {
      console.error('Failed to load shared analysis:', err);
      setShareError('Unable to load shared analysis. Please try again.');
      return null;
    } finally {
      setShareLoading(false);
    }
  }, []);

  /**
   * Get sharing status for an analysis
   */
  const getShareStatus = useCallback(async (analysisId) => {
    if (!analysisId) return null;

    try {
      const docRef = doc(db, 'readability-analyses', analysisId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return {
        isShared: data.isShared || false,
        shareToken: data.shareToken || null,
        shareExpiresAt: data.shareExpiry?.toDate?.() || null,
        shareUrl: data.shareToken
          ? `${window.location.origin}/shared/readability/${data.shareToken}`
          : null
      };
    } catch (err) {
      console.error('Failed to get share status:', err);
      return null;
    }
  }, []);

  return {
    // Share creation/management
    createShareLink,
    revokeShare,
    getShareStatus,
    isSharing,

    // Shared view loading
    loadSharedAnalysis,
    sharedAnalysis,
    shareLoading,
    shareError
  };
}

export default useReadabilityShare;
