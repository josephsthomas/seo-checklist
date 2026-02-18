import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  limit as firestoreLimit,
  startAfter
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Storage limits per role (Q7, promoted to MVP)
 */
const STORAGE_LIMITS = {
  admin: 500,
  project_manager: 250,
  seo_specialist: 100,
  developer: 100,
  content_writer: 100
};

const PAGE_SIZE = 20;

/**
 * Roles that can view all organization analyses
 * BRD: Admin sees all, PM sees org-level
 */
const ORG_LEVEL_ROLES = ['admin', 'project_manager'];

/**
 * useReadabilityHistory Hook
 *
 * History CRUD with pagination, filtering, sorting, and trend tracking.
 * Manages the readability-analyses Firestore collection.
 *
 * BRD References: US-2.5.1, US-2.5.2, FR-5.1, FR-5.2
 */
export function useReadabilityHistory() {
  const { currentUser, userProfile } = useAuth();
  const userRole = userProfile?.role || 'content_writer';
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Filters & sorting state
  const [filters, setFilters] = useState({
    searchUrl: '',
    dateFrom: null,
    dateTo: null,
    scoreMin: null,
    scoreMax: null
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  /**
   * Build Firestore query based on current filters and role
   */
  const buildQuery = useCallback((pageAfterDoc = null) => {
    const analysesRef = collection(db, 'readability-analyses');
    const constraints = [];

    // Role-based filtering: Admin/PM see all org, others see own only
    if (!ORG_LEVEL_ROLES.includes(userRole)) {
      constraints.push(where('userId', '==', currentUser?.uid));
    }

    // Score range filters
    if (filters.scoreMin !== null && filters.scoreMin !== undefined) {
      constraints.push(where('overallScore', '>=', filters.scoreMin));
    }
    if (filters.scoreMax !== null && filters.scoreMax !== undefined) {
      constraints.push(where('overallScore', '<=', filters.scoreMax));
    }

    // Sort
    constraints.push(orderBy(sortField, sortDirection));

    // Pagination
    constraints.push(firestoreLimit(PAGE_SIZE));
    if (pageAfterDoc) {
      constraints.push(startAfter(pageAfterDoc));
    }

    return query(analysesRef, ...constraints);
  }, [currentUser, userRole, filters.scoreMin, filters.scoreMax, sortField, sortDirection]);

  /**
   * Load history page
   * BRD: US-2.5.1 — list of all past analyses, sortable, filterable, paginated
   */
  const loadHistory = useCallback(async (resetPagination = true) => {
    if (!currentUser) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const afterDoc = resetPagination ? null : lastDoc;
      const q = buildQuery(afterDoc);
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || null
        };
      });

      // Client-side URL text search (Firestore doesn't support text search)
      let filteredItems = items;
      if (filters.searchUrl) {
        const searchLower = filters.searchUrl.toLowerCase();
        filteredItems = items.filter(item =>
          (item.sourceUrl || '').toLowerCase().includes(searchLower) ||
          (item.pageTitle || '').toLowerCase().includes(searchLower)
        );
      }

      // Client-side date range filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredItems = filteredItems.filter(item => item.createdAt >= fromDate);
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filteredItems = filteredItems.filter(item => item.createdAt <= toDate);
      }

      if (resetPagination) {
        setHistory(filteredItems);
        setPage(1);
      } else {
        setHistory(prev => [...prev, ...filteredItems]);
        setPage(prev => prev + 1);
      }

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to load readability history:', err);
      setError(err.message || 'Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  }, [currentUser, buildQuery, lastDoc, filters.searchUrl, filters.dateFrom, filters.dateTo]);

  /**
   * Load next page
   */
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadHistory(false);
    }
  }, [hasMore, loading, loadHistory]);

  /**
   * Get a single analysis by ID
   * BRD: Route /app/readability/:analysisId
   */
  const getAnalysisById = useCallback(async (analysisId) => {
    if (!analysisId) return null;

    try {
      const docRef = doc(db, 'readability-analyses', analysisId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();

      // Access control: must be owner or admin/PM
      if (!ORG_LEVEL_ROLES.includes(userRole) && data.userId !== currentUser?.uid) {
        throw new Error('You do not have permission to view this analysis.');
      }

      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || null
      };
    } catch (err) {
      console.error('Failed to load analysis:', err);
      throw err;
    }
  }, [currentUser, userRole]);

  /**
   * Delete an analysis
   * BRD: US-2.5.1 — delete individual items (own only, or admin)
   */
  const deleteAnalysis = useCallback(async (analysisId) => {
    if (!analysisId || !currentUser) return;

    try {
      // Verify ownership or admin role
      const docRef = doc(db, 'readability-analyses', analysisId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        toast.error('Analysis not found');
        return;
      }

      const data = docSnap.data();
      if (data.userId !== currentUser.uid && userRole !== 'admin') {
        toast.error('You can only delete your own analyses');
        return;
      }

      await deleteDoc(docRef);
      setHistory(prev => prev.filter(item => item.id !== analysisId));
      toast.success('Analysis deleted');
    } catch (err) {
      console.error('Failed to delete analysis:', err);
      toast.error(err.message || 'Failed to delete analysis');
    }
  }, [currentUser, userRole]);

  /**
   * Get trend data for a specific URL
   * BRD: E-CMO-03 — sparkline showing score progression, up to last 10 analyses
   */
  const getTrendData = useCallback(async (url) => {
    if (!url || !currentUser) return [];

    try {
      const analysesRef = collection(db, 'readability-analyses');
      const q = query(
        analysesRef,
        where('userId', '==', currentUser.uid),
        where('sourceUrl', '==', url),
        orderBy('createdAt', 'desc'),
        firestoreLimit(10)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          score: data.overallScore,
          grade: data.grade,
          date: data.createdAt?.toDate?.() || new Date(data.createdAt),
          scoreDelta: data.scoreDelta || null
        };
      }).reverse(); // Chronological order for sparkline
    } catch (err) {
      console.error('Failed to load trend data:', err);
      return [];
    }
  }, [currentUser]);

  /**
   * Get trend arrow for an analysis item
   * BRD: US-2.5.2 — ↑ improving (≥5), ↓ declining (≥5), → stable
   */
  const getTrendArrow = useCallback((item) => {
    if (item.scoreDelta === null || item.scoreDelta === undefined) return null;

    if (item.scoreDelta >= 5) return { direction: 'up', label: 'Improving', color: 'text-emerald-500' };
    if (item.scoreDelta <= -5) return { direction: 'down', label: 'Declining', color: 'text-red-500' };
    return { direction: 'stable', label: 'Stable', color: 'text-charcoal-400' };
  }, []);

  /**
   * Update filters and reload
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Update sort and reload
   */
  const updateSort = useCallback((field, direction) => {
    setSortField(field);
    setSortDirection(direction || 'desc');
  }, []);

  /**
   * Refresh history (reload from page 1)
   */
  const refresh = useCallback(() => {
    setLastDoc(null);
    loadHistory(true);
  }, [loadHistory]);

  // Load initial history when user changes
  useEffect(() => {
    if (currentUser) {
      loadHistory(true);
    }
  }, [currentUser]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when filters or sort change
  useEffect(() => {
    if (currentUser) {
      setLastDoc(null);
      loadHistory(true);
    }
  }, [filters.scoreMin, filters.scoreMax, sortField, sortDirection]);  // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Computed stats
   */
  const stats = useMemo(() => ({
    total: totalCount || history.length,
    storageLimit: STORAGE_LIMITS[userRole] || 100,
    used: history.length,
    isEmpty: !loading && history.length === 0,
    recentAnalyses: history.slice(0, 5)
  }), [history, loading, totalCount, userRole]);

  /**
   * Total pages estimate
   */
  const totalPages = useMemo(() => {
    return Math.ceil((totalCount || history.length) / PAGE_SIZE) || 1;
  }, [totalCount, history.length]);

  return {
    // Data
    history,
    loading,
    error,
    stats,

    // Pagination
    page,
    totalPages,
    hasMore,
    loadMore,

    // Filters & Sort
    filters,
    sortField,
    sortDirection,
    updateFilters,
    updateSort,

    // Actions
    loadHistory: refresh,
    deleteAnalysis,
    getAnalysisById,
    getTrendData,
    getTrendArrow,
    refresh
  };
}

export default useReadabilityHistory;
