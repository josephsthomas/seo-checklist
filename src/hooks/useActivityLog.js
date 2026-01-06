import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  limit as firestoreLimit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for project-specific activity log
 */
export function useProjectActivityLog(projectId, limit = 50) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'activity_log'),
      where('projectId', '==', projectId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs
        .slice(0, limit)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      setActivities(activitiesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, limit]);

  return { activities, loading };
}

/**
 * Hook for global user activity log with pagination
 */
export function useActivityLog(initialLimit = 20) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const { currentUser } = useAuth();

  // Initial load with real-time updates
  useEffect(() => {
    if (!currentUser) {
      setActivities([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'activity_log'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      firestoreLimit(initialLimit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length >= initialLimit);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, initialLimit]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!currentUser || !lastDoc || loading) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'activity_log'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        firestoreLimit(initialLimit)
      );

      const snapshot = await getDocs(q);
      const newActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setActivities(prev => [...prev, ...newActivities]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length >= initialLimit);
    } catch (error) {
      console.error('Error loading more activities:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, lastDoc, loading, initialLimit]);

  return { activities, loading, loadMore, hasMore };
}

/**
 * Log an activity (project-specific)
 */
export async function logActivity(projectId, userId, userName, action, details = {}) {
  try {
    await addDoc(collection(db, 'activity_log'), {
      projectId,
      userId,
      userName,
      action,
      type: action, // For timeline compatibility
      details,
      metadata: details, // For timeline compatibility
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Log a global user activity
 */
export async function logUserActivity(userId, type, description, metadata = {}) {
  try {
    await addDoc(collection(db, 'activity_log'), {
      userId,
      type,
      description,
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
}
