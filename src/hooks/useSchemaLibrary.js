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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useSchemaLibrary() {
  const { currentUser } = useAuth();
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved schemas
  useEffect(() => {
    if (!currentUser) {
      setSchemas([]);
      setLoading(false);
      return;
    }

    const schemasRef = collection(db, 'schemaLibrary');
    const q = query(
      schemasRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const schemaList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }));
        setSchemas(schemaList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching schemas:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Save schema to library
  const saveSchema = useCallback(async (schemaData) => {
    if (!currentUser) {
      toast.error('Please log in to save schemas');
      return null;
    }

    try {
      const schemasRef = collection(db, 'schemaLibrary');
      const docRef = await addDoc(schemasRef, {
        userId: currentUser.uid,
        name: schemaData.name,
        description: schemaData.description || '',
        schemaType: schemaData.schemaType,
        schema: schemaData.schema,
        tags: schemaData.tags || [],
        isPublic: schemaData.isPublic || false,
        usageCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Schema saved to library');
      return docRef.id;
    } catch (err) {
      console.error('Error saving schema:', err);
      toast.error('Failed to save schema');
      return null;
    }
  }, [currentUser]);

  // Update schema
  const updateSchema = useCallback(async (schemaId, updates) => {
    try {
      const schemaRef = doc(db, 'schemaLibrary', schemaId);
      await updateDoc(schemaRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      toast.success('Schema updated');
      return true;
    } catch (err) {
      console.error('Error updating schema:', err);
      toast.error('Failed to update schema');
      return false;
    }
  }, []);

  // Delete schema
  const deleteSchema = useCallback(async (schemaId) => {
    try {
      const schemaRef = doc(db, 'schemaLibrary', schemaId);
      await deleteDoc(schemaRef);
      toast.success('Schema deleted');
      return true;
    } catch (err) {
      console.error('Error deleting schema:', err);
      toast.error('Failed to delete schema');
      return false;
    }
  }, []);

  // Increment usage count
  const incrementUsage = useCallback(async (schemaId) => {
    const schema = schemas.find(s => s.id === schemaId);
    if (schema) {
      const schemaRef = doc(db, 'schemaLibrary', schemaId);
      await updateDoc(schemaRef, {
        usageCount: (schema.usageCount || 0) + 1,
        lastUsedAt: serverTimestamp(),
      });
    }
  }, [schemas]);

  // Duplicate schema
  const duplicateSchema = useCallback(async (schemaId) => {
    const schema = schemas.find(s => s.id === schemaId);
    if (!schema) return null;

    const { ...schemaData } = schema;
    return saveSchema({
      ...schemaData,
      name: `${schema.name} (Copy)`,
    });
  }, [schemas, saveSchema]);

  // Search schemas
  const searchSchemas = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return schemas;

    const lowerQuery = searchQuery.toLowerCase();
    return schemas.filter(schema =>
      schema.name?.toLowerCase().includes(lowerQuery) ||
      schema.description?.toLowerCase().includes(lowerQuery) ||
      schema.schemaType?.toLowerCase().includes(lowerQuery) ||
      schema.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [schemas]);

  // Get schemas by type
  const getByType = useCallback((schemaType) => {
    return schemas.filter(schema => schema.schemaType === schemaType);
  }, [schemas]);

  return {
    schemas,
    loading,
    saveSchema,
    updateSchema,
    deleteSchema,
    duplicateSchema,
    incrementUsage,
    searchSchemas,
    getByType,
    totalCount: schemas.length,
  };
}

// Common schema types
export const SCHEMA_TYPES = [
  { id: 'Article', label: 'Article', icon: 'file-text' },
  { id: 'Product', label: 'Product', icon: 'package' },
  { id: 'LocalBusiness', label: 'Local Business', icon: 'map-pin' },
  { id: 'Organization', label: 'Organization', icon: 'building' },
  { id: 'Person', label: 'Person', icon: 'user' },
  { id: 'Event', label: 'Event', icon: 'calendar' },
  { id: 'Recipe', label: 'Recipe', icon: 'utensils' },
  { id: 'FAQPage', label: 'FAQ', icon: 'help-circle' },
  { id: 'HowTo', label: 'How-To', icon: 'list-ordered' },
  { id: 'Review', label: 'Review', icon: 'star' },
  { id: 'BreadcrumbList', label: 'Breadcrumb', icon: 'chevrons-right' },
  { id: 'VideoObject', label: 'Video', icon: 'video' },
  { id: 'JobPosting', label: 'Job Posting', icon: 'briefcase' },
  { id: 'Course', label: 'Course', icon: 'graduation-cap' },
  { id: 'SoftwareApplication', label: 'Software App', icon: 'smartphone' },
];
