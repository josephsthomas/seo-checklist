/**
 * Audit Logging Utility
 * Central utility for logging user actions to Firestore audit_log collection
 * Supports project CRUD, file operations, schema changes, etc.
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

/**
 * Log an audit event to Firestore
 * @param {Object} params - Audit event parameters
 * @param {string} params.action - The action type (CREATE, READ, UPDATE, DELETE, EXPORT, etc.)
 * @param {string} params.targetType - The resource type (Project, Audit, Schema, File, etc.)
 * @param {string} params.targetId - The resource ID
 * @param {string} [params.targetName] - Human-readable resource name
 * @param {string} [params.userId] - User ID (defaults to current user)
 * @param {Object} [params.details] - Additional details about the action
 */
export async function logAuditEvent({ action, targetType, targetId, targetName, userId, details }) {
  try {
    const user = auth.currentUser;
    const effectiveUserId = userId || user?.uid;

    if (!effectiveUserId) return;

    await addDoc(collection(db, 'audit_log'), {
      action,
      resource: targetType,
      resourceId: targetId,
      resourceName: targetName || '',
      userId: effectiveUserId,
      userName: user?.displayName || user?.email || 'Unknown',
      userEmail: user?.email || '',
      timestamp: serverTimestamp(),
      success: true,
      details: details || {},
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    });
  } catch (err) {
    // Audit logging should never break the main flow
    console.warn('Failed to log audit event:', err);
  }
}

/**
 * Log a failed action
 */
export async function logAuditError({ action, targetType, targetId, targetName, errorMessage }) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, 'audit_log'), {
      action,
      resource: targetType,
      resourceId: targetId,
      resourceName: targetName || '',
      userId: user.uid,
      userName: user.displayName || user.email || 'Unknown',
      userEmail: user.email || '',
      timestamp: serverTimestamp(),
      success: false,
      errorMessage,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    });
  } catch (err) {
    console.warn('Failed to log audit error:', err);
  }
}
