import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export function useChecklist(projectId) {
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'checklist_completions', `${projectId}_completions`);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCompletions(docSnap.data());
      } else {
        setCompletions({});
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  const toggleItem = async (itemId) => {
    if (!projectId) return;

    const previousValue = !!completions[itemId];
    const newValue = !previousValue;

    try {
      const docRef = doc(db, 'checklist_completions', `${projectId}_completions`);

      // Update local state immediately for better UX
      setCompletions(prev => ({
        ...prev,
        [itemId]: newValue
      }));

      // Update in Firestore
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          [itemId]: newValue
        });
      } else {
        await setDoc(docRef, {
          [itemId]: newValue
        });
      }
    } catch {
      toast.error('Failed to update item');
      // Revert on error using captured previous value
      setCompletions(prev => ({
        ...prev,
        [itemId]: previousValue
      }));
    }
  };

  const bulkToggle = async (itemIds, value) => {
    if (!projectId) return;

    try {
      const docRef = doc(db, 'checklist_completions', `${projectId}_completions`);
      const updates = {};
      itemIds.forEach(id => {
        updates[id] = value;
      });

      // Update local state
      setCompletions(prev => ({
        ...prev,
        ...updates
      }));

      // Update in Firestore
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, updates);
      } else {
        await setDoc(docRef, updates);
      }

      toast.success(`Updated ${itemIds.length} items`);
    } catch {
      toast.error('Failed to update items');
    }
  };

  return {
    completions,
    loading,
    toggleItem,
    bulkToggle
  };
}
