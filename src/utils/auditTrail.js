/**
 * Audit Trail Utility
 * Logs important actions to a Firestore 'audit_trail' collection
 */
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const AUDIT_COLLECTION = 'audit_trail';

/**
 * Log an action to the audit trail
 * @param {string} action - The action type (e.g., 'role_change', 'file_upload', 'audit_save')
 * @param {string} resource - The resource type (e.g., 'user', 'file', 'audit')
 * @param {string} resourceId - The ID of the affected resource
 * @param {object} details - Additional details about the action
 */
export async function logAuditAction(action, resource, resourceId, details = {}) {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, AUDIT_COLLECTION), {
      action,
      resource,
      resourceId,
      userId: user?.uid || 'system',
      userEmail: user?.email || 'system',
      userName: user?.displayName || user?.email || 'System',
      details,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    // Audit logging should never break the main operation
    console.error('Failed to log audit action:', error);
  }
}

/**
 * Get audit trail entries for a resource
 * @param {string} resource - Resource type filter
 * @param {string} resourceId - Optional resource ID filter
 * @param {number} limitCount - Max entries to return
 */
export async function getAuditTrail(resource, resourceId = null, limitCount = 50) {
  try {
    let q;
    if (resourceId) {
      q = query(
        collection(db, AUDIT_COLLECTION),
        where('resource', '==', resource),
        where('resourceId', '==', resourceId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, AUDIT_COLLECTION),
        where('resource', '==', resource),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().createdAt)
    }));
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return [];
  }
}

// Action type constants
export const AUDIT_ACTIONS = {
  // Role changes
  ROLE_CHANGED: 'role_changed',

  // File operations
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted',

  // Audit operations
  AUDIT_SAVED: 'audit_saved',
  AUDIT_DELETED: 'audit_deleted',
  AUDIT_SHARED: 'audit_shared',
  AUDIT_SHARE_REVOKED: 'audit_share_revoked',
  AUDIT_VIEWED: 'audit_viewed'
};

export default { logAuditAction, getAuditTrail, AUDIT_ACTIONS };
