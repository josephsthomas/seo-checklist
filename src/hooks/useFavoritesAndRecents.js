import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const MAX_RECENT_ITEMS = 10;

// Item types
export const ITEM_TYPES = {
  PROJECT: 'project',
  TOOL: 'tool',
  AUDIT: 'audit',
  RESOURCE: 'resource'
};

/**
 * Hook for managing user favorites and recently accessed items
 */
export function useFavoritesAndRecents() {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from Firestore
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', currentUser.uid, 'settings', 'favorites_recents');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFavorites(data.favorites || []);
        setRecents(data.recents || []);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading favorites/recents:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Save data to Firestore
  const saveData = useCallback(async (newFavorites, newRecents) => {
    if (!currentUser?.uid) return;

    try {
      const docRef = doc(db, 'users', currentUser.uid, 'settings', 'favorites_recents');
      await setDoc(docRef, {
        favorites: newFavorites,
        recents: newRecents,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving favorites/recents:', error);
    }
  }, [currentUser]);

  // Add to favorites
  const addToFavorites = useCallback((item) => {
    const exists = favorites.some(f => f.id === item.id && f.type === item.type);
    if (exists) return;

    const newItem = {
      ...item,
      addedAt: new Date().toISOString()
    };

    const newFavorites = [newItem, ...favorites];
    setFavorites(newFavorites);
    saveData(newFavorites, recents);
  }, [favorites, recents, saveData]);

  // Remove from favorites
  const removeFromFavorites = useCallback((itemId, itemType) => {
    const newFavorites = favorites.filter(f => !(f.id === itemId && f.type === itemType));
    setFavorites(newFavorites);
    saveData(newFavorites, recents);
  }, [favorites, recents, saveData]);

  // Toggle favorite
  const toggleFavorite = useCallback((item) => {
    const isFav = favorites.some(f => f.id === item.id && f.type === item.type);
    if (isFav) {
      removeFromFavorites(item.id, item.type);
    } else {
      addToFavorites(item);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  // Check if item is a favorite
  const isFavorite = useCallback((itemId, itemType) => {
    return favorites.some(f => f.id === itemId && f.type === itemType);
  }, [favorites]);

  // Add to recents
  const addToRecents = useCallback((item) => {
    // Remove if already exists
    const filtered = recents.filter(r => !(r.id === item.id && r.type === item.type));

    const newItem = {
      ...item,
      accessedAt: new Date().toISOString()
    };

    // Add to front and limit
    const newRecents = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
    setRecents(newRecents);
    saveData(favorites, newRecents);
  }, [favorites, recents, saveData]);

  // Clear recents
  const clearRecents = useCallback(() => {
    setRecents([]);
    saveData(favorites, []);
  }, [favorites, saveData]);

  // Get recents by type
  const getRecentsByType = useCallback((type) => {
    return recents.filter(r => r.type === type);
  }, [recents]);

  // Get favorites by type
  const getFavoritesByType = useCallback((type) => {
    return favorites.filter(f => f.type === type);
  }, [favorites]);

  return {
    favorites,
    recents,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    addToRecents,
    clearRecents,
    getRecentsByType,
    getFavoritesByType
  };
}

/**
 * Helper to create item objects
 */
export function createItem(type, id, name, path, icon = null, extra = {}) {
  return {
    type,
    id,
    name,
    path,
    icon,
    ...extra
  };
}

export default useFavoritesAndRecents;
