import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Export types configuration
 */
export const EXPORT_TYPES = {
  AUDIT: {
    id: 'audit',
    label: 'Technical Audit',
    icon: 'Search',
    color: 'cyan',
    formats: ['pdf', 'xlsx', 'json']
  },
  ACCESSIBILITY: {
    id: 'accessibility',
    label: 'Accessibility Report',
    icon: 'Accessibility',
    color: 'purple',
    formats: ['pdf', 'xlsx', 'csv']
  },
  IMAGE_ALT: {
    id: 'image_alt',
    label: 'Image Alt Text',
    icon: 'Image',
    color: 'emerald',
    formats: ['xlsx', 'csv', 'zip']
  },
  META_DATA: {
    id: 'meta_data',
    label: 'Meta Data',
    icon: 'Tags',
    color: 'amber',
    formats: ['xlsx', 'json', 'html']
  },
  SCHEMA: {
    id: 'schema',
    label: 'Structured Data',
    icon: 'Code2',
    color: 'rose',
    formats: ['json', 'html']
  },
  CHECKLIST: {
    id: 'checklist',
    label: 'SEO Checklist',
    icon: 'ClipboardList',
    color: 'primary',
    formats: ['pdf', 'xlsx']
  },
  READABILITY: {
    id: 'readability',
    label: 'AI Readability',
    icon: 'ScanEye',
    color: 'teal',
    formats: ['pdf', 'json']
  }
};

/**
 * Hook to manage export history
 */
export function useExportHistory(limit = 20) {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setExports([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'export_history'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const exportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExports(exportsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, limit]);

  // Log a new export
  const logExport = useCallback(async (exportData) => {
    if (!currentUser) return null;

    try {
      const docRef = await addDoc(collection(db, 'export_history'), {
        userId: currentUser.uid,
        ...exportData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging export:', error);
      return null;
    }
  }, [currentUser]);

  // Delete an export record
  const deleteExport = useCallback(async (exportId) => {
    try {
      await deleteDoc(doc(db, 'export_history', exportId));
    } catch (error) {
      console.error('Error deleting export record:', error);
    }
  }, []);

  return { exports, loading, logExport, deleteExport };
}

/**
 * Hook to get pending exports (items that haven't been exported yet)
 */
export function usePendingExports() {
  const [pending] = useState({
    audits: [],
    accessibility: [],
    imageAlt: [],
    metaData: [],
    schemas: [],
    checklists: []
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // This would normally fetch from each collection
    // For now, we'll set up the structure
    setLoading(false);
  }, [currentUser]);

  return { pending, loading };
}

export default useExportHistory;
