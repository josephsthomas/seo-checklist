/**
 * Cascade Delete Utilities
 * Handles cleanup of related data when projects or accounts are deleted
 */

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Delete all data associated with a project
 * Called when a project is permanently deleted
 * @param {string} projectId - The project ID to cascade delete
 */
export async function cascadeDeleteProject(projectId) {
  const collectionsToClean = [
    { name: 'comments', field: 'projectId' },
    { name: 'time_entries', field: 'projectId' },
    { name: 'file_attachments', field: 'projectId' },
    { name: 'activity_log', field: 'projectId' },
    { name: 'notifications', field: 'data.projectId' }
  ];

  const errors = [];

  for (const col of collectionsToClean) {
    try {
      const q = query(
        collection(db, col.name),
        where(col.field, '==', projectId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) continue;

      // Batch delete in groups of 500 (Firestore limit)
      const BATCH_SIZE = 500;
      const docs = snapshot.docs;

      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + BATCH_SIZE);
        chunk.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
    } catch (err) {
      errors.push({ collection: col.name, error: err.message });
      console.warn(`Failed to clean up ${col.name} for project ${projectId}:`, err);
    }
  }

  // Clean up assignments document
  try {
    const { doc: docRef, deleteDoc: delDoc } = await import('firebase/firestore');
    const assignmentRef = docRef(db, 'checklist_assignments', `${projectId}_assignments`);
    await delDoc(assignmentRef);
  } catch {
    // Assignment document may not exist
  }

  return errors;
}

/**
 * Additional collections to clean during account deletion
 * Returns array of collection configs for cleanup
 */
export function getAccountCleanupCollections(userId) {
  return [
    { name: 'schemaLibrary', field: 'userId' },
    { name: 'feedback', field: 'userId' },
    { name: 'readability-analyses', field: 'userId' },
    { name: 'audit_log', field: 'userId' },
    { name: 'audits', field: 'userId' },
    { name: 'sharedAudits', field: 'userId' }
  ];
}

/**
 * Clean up additional collections during account deletion
 * @param {string} userId - The user ID being deleted
 */
export async function cascadeDeleteAccount(userId) {
  const collections = getAccountCleanupCollections(userId);
  const errors = [];

  for (const col of collections) {
    try {
      const q = query(
        collection(db, col.name),
        where(col.field, '==', userId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) continue;

      const BATCH_SIZE = 500;
      const docs = snapshot.docs;

      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + BATCH_SIZE);
        chunk.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
    } catch (err) {
      errors.push({ collection: col.name, error: err.message });
      console.warn(`Failed to clean up ${col.name} for user ${userId}:`, err);
    }
  }

  return errors;
}
