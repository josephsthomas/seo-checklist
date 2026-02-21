/**
 * Orphaned Storage File Cleanup Utility
 * Identifies and removes Storage files that no longer have Firestore references
 */
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ref, listAll, deleteObject, getMetadata } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { logError } from './logger';

/**
 * Find orphaned files in a Storage path by cross-referencing with Firestore
 * @param {string} projectId - Project ID to check
 * @returns {Promise<{orphaned: Array, referenced: number, total: number}>}
 */
export async function findOrphanedFiles(projectId) {
  try {
    // Get all files in the project's storage
    const storageRef = ref(storage, `projects/${projectId}`);
    const fileList = await listAllRecursive(storageRef);

    // Get all attachment records from Firestore for this project
    const q = query(
      collection(db, 'attachments'),
      where('projectId', '==', projectId)
    );
    const snapshot = await getDocs(q);
    const referencedPaths = new Set(
      snapshot.docs.map(doc => doc.data().storagePath)
    );

    const orphaned = [];
    const referenced = [];

    for (const file of fileList) {
      if (referencedPaths.has(file.fullPath)) {
        referenced.push(file.fullPath);
      } else {
        try {
          const metadata = await getMetadata(file);
          orphaned.push({
            path: file.fullPath,
            name: file.name,
            size: metadata.size,
            created: metadata.timeCreated,
            updated: metadata.updated
          });
        } catch {
          orphaned.push({ path: file.fullPath, name: file.name, size: 0 });
        }
      }
    }

    return {
      orphaned,
      referenced: referenced.length,
      total: fileList.length
    };
  } catch (error) {
    logError('storageCleanup', error, { action: 'findOrphanedFiles', projectId });
    return { orphaned: [], referenced: 0, total: 0 };
  }
}

/**
 * Recursively list all files in a Storage reference
 */
async function listAllRecursive(storageRef) {
  const result = await listAll(storageRef);
  let files = [...result.items];

  for (const prefix of result.prefixes) {
    const subFiles = await listAllRecursive(prefix);
    files = [...files, ...subFiles];
  }

  return files;
}

/**
 * Delete orphaned files from Storage
 * @param {Array} orphanedFiles - Array of orphaned file objects with path property
 * @returns {Promise<{deleted: number, failed: number}>}
 */
export async function cleanupOrphanedFiles(orphanedFiles) {
  let deleted = 0;
  let failed = 0;

  for (const file of orphanedFiles) {
    try {
      const fileRef = ref(storage, file.path);
      await deleteObject(fileRef);
      deleted++;
    } catch (error) {
      logError('storageCleanup', error, { action: 'cleanupOrphanedFiles', path: file.path });
      failed++;
    }
  }

  return { deleted, failed };
}

/**
 * Get storage usage summary
 * @returns {Promise<{totalFiles: number, totalSize: number, byProject: Object}>}
 */
export async function getStorageUsageSummary() {
  try {
    const snapshot = await getDocs(collection(db, 'attachments'));
    const byProject = {};
    let totalSize = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const projectId = data.projectId || 'unknown';
      if (!byProject[projectId]) {
        byProject[projectId] = { fileCount: 0, totalSize: 0 };
      }
      byProject[projectId].fileCount++;
      byProject[projectId].totalSize += data.fileSize || 0;
      totalSize += data.fileSize || 0;
    });

    return {
      totalFiles: snapshot.docs.length,
      totalSize,
      byProject
    };
  } catch (error) {
    logError('storageCleanup', error, { action: 'getStorageUsageSummary' });
    return { totalFiles: 0, totalSize: 0, byProject: {} };
  }
}

export default { findOrphanedFiles, cleanupOrphanedFiles, getStorageUsageSummary };
