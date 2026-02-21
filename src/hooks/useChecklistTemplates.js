import { useState, useEffect, useCallback } from 'react';
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
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useChecklistTemplates() {
  const { currentUser } = useAuth();
  const [ownTemplates, setOwnTemplates] = useState([]);
  const [sharedTemplates, setSharedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's own templates
  useEffect(() => {
    if (!currentUser) {
      setOwnTemplates([]);
      setSharedTemplates([]);
      setLoading(false);
      return;
    }

    const templatesRef = collection(db, 'checklistTemplates');

    // Query for user's own templates
    const ownQuery = query(
      templatesRef,
      where('createdBy', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Query for shared templates from other users
    const sharedQuery = query(
      templatesRef,
      where('isShared', '==', true),
      orderBy('createdAt', 'desc')
    );

    const mapDoc = (doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    });

    const unsubOwn = onSnapshot(
      ownQuery,
      (snapshot) => {
        setOwnTemplates(snapshot.docs.map(mapDoc));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching own templates:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    const unsubShared = onSnapshot(
      sharedQuery,
      (snapshot) => {
        // Exclude own templates from shared results
        const shared = snapshot.docs
          .map(mapDoc)
          .filter(t => t.createdBy !== currentUser.uid);
        setSharedTemplates(shared);
      },
      (err) => {
        console.error('Error fetching shared templates:', err);
      }
    );

    return () => {
      unsubOwn();
      unsubShared();
    };
  }, [currentUser]);

  // Merge own + shared templates
  const templates = [...ownTemplates, ...sharedTemplates.map(t => ({ ...t, _isShared: true }))];

  // Create a new template
  const createTemplate = useCallback(async (templateData) => {
    if (!currentUser) {
      toast.error('Please log in to create templates');
      return null;
    }

    try {
      const templatesRef = collection(db, 'checklistTemplates');
      const docRef = await addDoc(templatesRef, {
        ...templateData,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        usageCount: 0,
        isShared: templateData.isShared || false,
      });

      toast.success('Template created successfully');
      return docRef.id;
    } catch (err) {
      console.error('Error creating template:', err);
      toast.error('Failed to create template');
      return null;
    }
  }, [currentUser]);

  // Update a template
  const updateTemplate = useCallback(async (templateId, updates) => {
    try {
      const templateRef = doc(db, 'checklistTemplates', templateId);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      toast.success('Template updated');
      return true;
    } catch (err) {
      console.error('Error updating template:', err);
      toast.error('Failed to update template');
      return false;
    }
  }, []);

  // Delete a template
  const deleteTemplate = useCallback(async (templateId) => {
    try {
      const templateRef = doc(db, 'checklistTemplates', templateId);
      await deleteDoc(templateRef);
      toast.success('Template deleted');
      return true;
    } catch (err) {
      console.error('Error deleting template:', err);
      toast.error('Failed to delete template');
      return false;
    }
  }, []);

  // Increment usage count
  const incrementUsage = useCallback(async (templateId) => {
    try {
      const templateRef = doc(db, 'checklistTemplates', templateId);
      setOwnTemplates(prev => prev.map(t =>
        t.id === templateId ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
      ));
      await updateDoc(templateRef, {
        usageCount: increment(1),
        lastUsedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating usage count:', err);
    }
  }, []);

  // Duplicate a template
  const duplicateTemplate = useCallback(async (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    const { ...templateData } = template;

    return createTemplate({
      ...templateData,
      name: `${template.name} (Copy)`,
    });
  }, [templates, createTemplate]);

  // Share a template
  const shareTemplate = useCallback(async (templateId) => {
    try {
      const templateRef = doc(db, 'checklistTemplates', templateId);
      await updateDoc(templateRef, {
        isShared: true,
        updatedAt: serverTimestamp(),
      });
      toast.success('Template shared with team');
      return true;
    } catch (err) {
      console.error('Error sharing template:', err);
      toast.error('Failed to share template');
      return false;
    }
  }, []);

  // Unshare a template
  const unshareTemplate = useCallback(async (templateId) => {
    try {
      const templateRef = doc(db, 'checklistTemplates', templateId);
      await updateDoc(templateRef, {
        isShared: false,
        updatedAt: serverTimestamp(),
      });
      toast.success('Template is now private');
      return true;
    } catch (err) {
      console.error('Error unsharing template:', err);
      toast.error('Failed to unshare template');
      return false;
    }
  }, []);

  return {
    templates,
    sharedTemplates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    incrementUsage,
    shareTemplate,
    unshareTemplate,
  };
}

// Built-in default templates
export const DEFAULT_TEMPLATES = [
  {
    id: 'default-full',
    name: 'Complete SEO Checklist',
    description: 'Full checklist with all categories for comprehensive SEO projects',
    isDefault: true,
    categories: ['all'],
    itemCount: 100,
    icon: 'clipboard-list',
  },
  {
    id: 'default-technical',
    name: 'Technical SEO Focus',
    description: 'Focus on technical aspects: site speed, crawlability, indexing',
    isDefault: true,
    categories: ['Technical SEO', 'Performance', 'Security'],
    itemCount: 35,
    icon: 'settings',
  },
  {
    id: 'default-content',
    name: 'Content Optimization',
    description: 'Content-focused checklist for blog posts and landing pages',
    isDefault: true,
    categories: ['Content Strategy', 'On-Page Optimization', 'Keyword Research'],
    itemCount: 40,
    icon: 'file-text',
  },
  {
    id: 'default-local',
    name: 'Local SEO',
    description: 'Local business optimization checklist',
    isDefault: true,
    categories: ['Local SEO', 'Schema Markup', 'Knowledge Graph'],
    itemCount: 25,
    icon: 'map-pin',
  },
  {
    id: 'default-ecommerce',
    name: 'E-commerce SEO',
    description: 'Product pages, categories, and e-commerce specific optimizations',
    isDefault: true,
    categories: ['E-Commerce SEO', 'Schema Markup', 'On-Page Optimization'],
    itemCount: 45,
    icon: 'shopping-cart',
  },
  {
    id: 'default-launch',
    name: 'Website Launch',
    description: 'Pre-launch and post-launch SEO checklist',
    isDefault: true,
    categories: ['Foundation & Setup', 'Site Refresh/Migration', 'Testing & QA'],
    itemCount: 30,
    icon: 'rocket',
  },
];
