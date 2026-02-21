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
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Item types that can be linked to projects
export const LINKED_ITEM_TYPES = {
  AUDIT: 'audit',
  ACCESSIBILITY: 'accessibility',
  IMAGE_ALT: 'imageAlt',
  META_DATA: 'metaData',
  SCHEMA: 'schema'
};

// Type display info
export const ITEM_TYPE_INFO = {
  [LINKED_ITEM_TYPES.AUDIT]: {
    label: 'Technical Audit',
    color: 'cyan',
    icon: 'Search'
  },
  [LINKED_ITEM_TYPES.ACCESSIBILITY]: {
    label: 'Accessibility Analysis',
    color: 'purple',
    icon: 'Accessibility'
  },
  [LINKED_ITEM_TYPES.IMAGE_ALT]: {
    label: 'Image Alt',
    color: 'emerald',
    icon: 'Image'
  },
  [LINKED_ITEM_TYPES.META_DATA]: {
    label: 'Metadata',
    color: 'amber',
    icon: 'Tags'
  },
  [LINKED_ITEM_TYPES.SCHEMA]: {
    label: 'Schema',
    color: 'rose',
    icon: 'Code2'
  }
};

/**
 * Hook for managing items linked to a project
 */
export function useProjectLinkedItems(projectId) {
  const [linkedItems, setLinkedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Listen for linked items
  useEffect(() => {
    if (!currentUser || !projectId) {
      setLinkedItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'projectLinks'),
      where('projectId', '==', projectId),
      where('userId', '==', currentUser.uid),
      orderBy('linkedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        linkId: doc.id,
        ...doc.data(),
        linkedAt: doc.data().linkedAt?.toDate?.() || new Date()
      }));
      setLinkedItems(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, projectId]);

  // Link an item to the project
  const linkItem = useCallback(async (item) => {
    if (!currentUser || !projectId) {
      throw new Error('Must be logged in with a valid project');
    }

    try {
      await addDoc(collection(db, 'projectLinks'), {
        projectId,
        userId: currentUser.uid,
        itemId: item.id,
        itemType: item.type,
        itemName: item.name,
        itemUrl: item.url || null,
        itemData: item.data || null,
        linkedAt: serverTimestamp()
      });
      toast.success(`${ITEM_TYPE_INFO[item.type]?.label || 'Item'} linked to project`);
    } catch (error) {
      console.error('Error linking item:', error);
      toast.error('Failed to link item to project');
      throw error;
    }
  }, [currentUser, projectId]);

  // Unlink an item from the project
  const unlinkItem = useCallback(async (linkId) => {
    try {
      await deleteDoc(doc(db, 'projectLinks', linkId));
      toast.success('Item unlinked from project');
    } catch (error) {
      console.error('Error unlinking item:', error);
      toast.error('Failed to unlink item');
      throw error;
    }
  }, []);

  // Get items by type
  const getItemsByType = useCallback((type) => {
    return linkedItems.filter(item => item.itemType === type);
  }, [linkedItems]);

  // Check if an item is linked
  const isLinked = useCallback((itemId) => {
    return linkedItems.some(item => item.itemId === itemId);
  }, [linkedItems]);

  // Get stats
  const stats = {
    total: linkedItems.length,
    byType: Object.values(LINKED_ITEM_TYPES).reduce((acc, type) => {
      acc[type] = linkedItems.filter(item => item.itemType === type).length;
      return acc;
    }, {})
  };

  return {
    linkedItems,
    loading,
    linkItem,
    unlinkItem,
    getItemsByType,
    isLinked,
    stats
  };
}

/**
 * Hook for linking items from tool pages (works without a specific project context)
 */
export function useLinkToProject() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load user's projects
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'projects'),
      where('ownerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Link item to a specific project
  const linkToProject = useCallback(async (projectId, item) => {
    if (!currentUser) {
      throw new Error('Must be logged in');
    }

    try {
      await addDoc(collection(db, 'projectLinks'), {
        projectId,
        userId: currentUser.uid,
        itemId: item.id,
        itemType: item.type,
        itemName: item.name,
        itemUrl: item.url || null,
        itemData: item.data || null,
        linkedAt: serverTimestamp()
      });

      const project = projects.find(p => p.id === projectId);
      toast.success(`Linked to "${project?.name || 'project'}"`);
      return true;
    } catch (error) {
      console.error('Error linking to project:', error);
      toast.error('Failed to link to project');
      throw error;
    }
  }, [currentUser, projects]);

  // Get linked projects for an item
  const getLinkedProjects = useCallback(async (itemId) => {
    if (!currentUser) return [];

    try {
      const q = query(
        collection(db, 'projectLinks'),
        where('userId', '==', currentUser.uid),
        where('itemId', '==', itemId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().projectId);
    } catch (error) {
      console.error('Error getting linked projects:', error);
      return [];
    }
  }, [currentUser]);

  // Unlink an item from a project by link document ID
  const unlinkFromProject = useCallback(async (linkId) => {
    try {
      await deleteDoc(doc(db, 'projectLinks', linkId));
      toast.success('Unlinked from project');
    } catch (error) {
      console.error('Error unlinking from project:', error);
      toast.error('Failed to unlink from project');
      throw error;
    }
  }, []);

  // Get linked projects with their link document IDs
  const getLinkedProjectLinks = useCallback(async (itemId) => {
    if (!currentUser) return [];

    try {
      const q = query(
        collection(db, 'projectLinks'),
        where('userId', '==', currentUser.uid),
        where('itemId', '==', itemId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ linkId: d.id, projectId: d.data().projectId }));
    } catch (error) {
      console.error('Error getting linked project links:', error);
      return [];
    }
  }, [currentUser]);

  return {
    projects,
    loading,
    linkToProject,
    unlinkFromProject,
    getLinkedProjects,
    getLinkedProjectLinks
  };
}

export default useProjectLinkedItems;
