import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useAltTextHistory(limitCount = 50) {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch alt text history
  useEffect(() => {
    if (!currentUser) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const historyRef = collection(db, 'altTextHistory');
    const q = query(
      historyRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const historyList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        setHistory(historyList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching alt text history:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, limitCount]);

  // Add new entry to history
  const addToHistory = useCallback(async (entry) => {
    if (!currentUser) return null;

    try {
      const historyRef = collection(db, 'altTextHistory');
      const docRef = await addDoc(historyRef, {
        userId: currentUser.uid,
        imageUrl: entry.imageUrl,
        imageName: entry.imageName,
        imageHash: entry.imageHash, // For matching similar images
        altText: entry.altText,
        tone: entry.tone,
        context: entry.context,
        projectId: entry.projectId || null,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error('Error adding to history:', err);
      return null;
    }
  }, [currentUser]);

  // Delete entry from history
  const deleteFromHistory = useCallback(async (entryId) => {
    try {
      await deleteDoc(doc(db, 'altTextHistory', entryId));
      return true;
    } catch (err) {
      console.error('Error deleting from history:', err);
      return false;
    }
  }, []);

  // Search history
  const searchHistory = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return history;

    const lowerQuery = searchQuery.toLowerCase();
    return history.filter(entry =>
      entry.altText?.toLowerCase().includes(lowerQuery) ||
      entry.imageName?.toLowerCase().includes(lowerQuery) ||
      entry.context?.toLowerCase().includes(lowerQuery)
    );
  }, [history]);

  // Find similar alt text by image name or hash
  const findSimilar = useCallback((imageName, imageHash) => {
    return history.filter(entry =>
      (imageHash && entry.imageHash === imageHash) ||
      (imageName && entry.imageName?.toLowerCase() === imageName.toLowerCase())
    );
  }, [history]);

  // Get most used tones
  const getMostUsedTones = useCallback(() => {
    const toneCounts = history.reduce((acc, entry) => {
      if (entry.tone) {
        acc[entry.tone] = (acc[entry.tone] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(toneCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tone, count]) => ({ tone, count }));
  }, [history]);

  // Clear all history
  const clearHistory = useCallback(async () => {
    if (!currentUser) return false;

    try {
      const historyRef = collection(db, 'altTextHistory');
      const q = query(historyRef, where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);

      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      return true;
    } catch (err) {
      console.error('Error clearing history:', err);
      return false;
    }
  }, [currentUser]);

  return {
    history,
    loading,
    addToHistory,
    deleteFromHistory,
    searchHistory,
    findSimilar,
    getMostUsedTones,
    clearHistory,
    totalCount: history.length,
  };
}
