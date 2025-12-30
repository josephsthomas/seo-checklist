/**
 * Audit Storage Service
 * Handles saving audits to Firestore and generating shareable links
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';

const AUDITS_COLLECTION = 'audits';
const SHARED_AUDITS_COLLECTION = 'sharedAudits';

/**
 * Generate a random share ID
 */
function generateShareId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Hash password using Web Crypto API
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password against hash
 */
async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Save audit to Firestore
 */
export async function saveAudit(auditResults, urlData = [], domainInfo = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be logged in to save audits');
  }

  const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const auditDoc = {
    id: auditId,
    userId: user.uid,
    userEmail: user.email,
    domain: domainInfo.domain || 'Unknown',
    healthScore: auditResults.healthScore,
    stats: auditResults.stats,
    urlCount: auditResults.urlCount,
    issueCount: auditResults.issues?.length || 0,
    // Store issues separately to handle large datasets
    issues: auditResults.issues.slice(0, 500), // Limit to prevent exceeding Firestore doc size
    // Store metadata about URL data
    urlDataCount: urlData.length,
    // Store sample URL data (full data would exceed limits)
    urlDataSample: urlData.slice(0, 100),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, AUDITS_COLLECTION, auditId), auditDoc);

  return auditId;
}

/**
 * Get all audits for the current user
 */
export async function getUserAudits(limitCount = 20) {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }

  const auditsRef = collection(db, AUDITS_COLLECTION);
  const q = query(
    auditsRef,
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date()
  }));
}

/**
 * Get a specific audit by ID
 */
export async function getAudit(auditId) {
  const docRef = doc(db, AUDITS_COLLECTION, auditId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();

  // Check if user has access
  const user = auth.currentUser;
  if (data.userId !== user?.uid) {
    throw new Error('Access denied');
  }

  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date()
  };
}

/**
 * Delete an audit
 */
export async function deleteAudit(auditId) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be logged in to delete audits');
  }

  // Verify ownership first
  const docRef = doc(db, AUDITS_COLLECTION, auditId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Audit not found');
  }

  if (docSnap.data().userId !== user.uid) {
    throw new Error('Access denied');
  }

  // Delete any shared links for this audit
  const sharedRef = collection(db, SHARED_AUDITS_COLLECTION);
  const sharedQuery = query(sharedRef, where('auditId', '==', auditId));
  const sharedDocs = await getDocs(sharedQuery);

  const deletePromises = sharedDocs.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Delete the audit
  await deleteDoc(docRef);
}

/**
 * Create a shareable link for an audit
 */
export async function createShareLink(auditId, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be logged in to share audits');
  }

  const { password, expiresIn } = options;

  // Verify audit exists and user owns it
  const auditRef = doc(db, AUDITS_COLLECTION, auditId);
  const auditSnap = await getDoc(auditRef);

  if (!auditSnap.exists()) {
    throw new Error('Audit not found');
  }

  if (auditSnap.data().userId !== user.uid) {
    throw new Error('Access denied');
  }

  const shareId = generateShareId();

  const shareDoc = {
    shareId,
    auditId,
    userId: user.uid,
    createdAt: serverTimestamp(),
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : null,
    hasPassword: !!password,
    passwordHash: password ? await hashPassword(password) : null,
    viewCount: 0
  };

  await setDoc(doc(db, SHARED_AUDITS_COLLECTION, shareId), shareDoc);

  // Update audit with share info
  await updateDoc(auditRef, {
    isShared: true,
    shareId,
    updatedAt: serverTimestamp()
  });

  return {
    shareId,
    shareUrl: `${window.location.origin}/audit/shared/${shareId}`,
    hasPassword: !!password,
    expiresAt: shareDoc.expiresAt
  };
}

/**
 * Revoke a share link
 */
export async function revokeShareLink(auditId) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be logged in');
  }

  // Find and delete the share document
  const auditRef = doc(db, AUDITS_COLLECTION, auditId);
  const auditSnap = await getDoc(auditRef);

  if (!auditSnap.exists() || auditSnap.data().userId !== user.uid) {
    throw new Error('Access denied');
  }

  const shareId = auditSnap.data().shareId;
  if (shareId) {
    await deleteDoc(doc(db, SHARED_AUDITS_COLLECTION, shareId));
  }

  // Update audit
  await updateDoc(auditRef, {
    isShared: false,
    shareId: null,
    updatedAt: serverTimestamp()
  });
}

/**
 * Get a shared audit (public access)
 */
export async function getSharedAudit(shareId, password = null) {
  const shareRef = doc(db, SHARED_AUDITS_COLLECTION, shareId);
  const shareSnap = await getDoc(shareRef);

  if (!shareSnap.exists()) {
    throw new Error('Share link not found or expired');
  }

  const shareData = shareSnap.data();

  // Check expiration
  if (shareData.expiresAt && shareData.expiresAt.toDate() < new Date()) {
    throw new Error('This share link has expired');
  }

  // Check password
  if (shareData.hasPassword) {
    if (!password) {
      return { requiresPassword: true };
    }

    const isValid = await verifyPassword(password, shareData.passwordHash);
    if (!isValid) {
      throw new Error('Incorrect password');
    }
  }

  // Get the actual audit
  const auditRef = doc(db, AUDITS_COLLECTION, shareData.auditId);
  const auditSnap = await getDoc(auditRef);

  if (!auditSnap.exists()) {
    throw new Error('Audit not found');
  }

  // Increment view count
  await updateDoc(shareRef, {
    viewCount: (shareData.viewCount || 0) + 1
  });

  const auditData = auditSnap.data();

  return {
    audit: {
      id: auditSnap.id,
      domain: auditData.domain,
      healthScore: auditData.healthScore,
      stats: auditData.stats,
      urlCount: auditData.urlCount,
      issues: auditData.issues,
      createdAt: auditData.createdAt?.toDate?.() || new Date()
    },
    shareInfo: {
      viewCount: shareData.viewCount + 1,
      createdAt: shareData.createdAt?.toDate?.() || new Date()
    }
  };
}

export default {
  saveAudit,
  getUserAudits,
  getAudit,
  deleteAudit,
  createShareLink,
  revokeShareLink,
  getSharedAudit
};
