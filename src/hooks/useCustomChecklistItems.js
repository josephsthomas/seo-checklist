import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Hook for managing custom checklist items per project
 */
export function useCustomChecklistItems(projectId) {
  const [customItems, setCustomItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const customItemsRef = useRef(customItems);
  customItemsRef.current = customItems;

  useEffect(() => {
    if (!projectId || !currentUser) {
      setCustomItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'custom_checklist_items'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        isCustom: true,
        ...doc.data()
      }));
      setCustomItems(items);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to custom checklist items:', error);
      toast.error('Failed to load custom checklist items');
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, currentUser]);

  // Add a new custom item
  const addItem = useCallback(async (itemData) => {
    if (!projectId || !currentUser) return null;

    try {
      const docRef = await addDoc(collection(db, 'custom_checklist_items'), {
        projectId,
        userId: currentUser.uid,
        item: itemData.title,
        description: itemData.description || '',
        phase: itemData.phase || 'Custom',
        priority: itemData.priority || 'MEDIUM',
        category: itemData.category || 'Custom',
        owner: itemData.owner || 'Team',
        dueDate: itemData.dueDate || null,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Custom item added');
      return docRef.id;
    } catch (error) {
      console.error('Error adding custom item:', error);
      toast.error('Failed to add item');
      return null;
    }
  }, [projectId, currentUser]);

  // Update a custom item
  const updateItem = useCallback(async (itemId, updates) => {
    try {
      const docRef = doc(db, 'custom_checklist_items', itemId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      toast.success('Item updated');
    } catch (error) {
      console.error('Error updating custom item:', error);
      toast.error('Failed to update item');
    }
  }, []);

  // Delete a custom item
  const deleteItem = useCallback(async (itemId) => {
    try {
      await deleteDoc(doc(db, 'custom_checklist_items', itemId));
      toast.success('Item deleted');
    } catch (error) {
      console.error('Error deleting custom item:', error);
      toast.error('Failed to delete item');
    }
  }, []);

  // Toggle completion
  const toggleComplete = useCallback(async (itemId) => {
    const item = customItemsRef.current.find(i => i.id === itemId);
    if (!item) return;

    try {
      const docRef = doc(db, 'custom_checklist_items', itemId);
      await updateDoc(docRef, {
        completed: !item.completed,
        completedAt: !item.completed ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error toggling custom item:', error);
      toast.error('Failed to update item');
    }
  }, []);

  return {
    customItems,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleComplete
  };
}

export default useCustomChecklistItems;
