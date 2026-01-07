import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserAudits,
  saveAudit,
  deleteAudit,
  createShareLink,
  revokeShareLink
} from '../lib/audit/auditStorageService';
import toast from 'react-hot-toast';

/**
 * Hook for managing audits with real-time updates
 */
export function useAudits(limitCount = 20) {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Real-time subscription to audits
  useEffect(() => {
    if (!currentUser) {
      setAudits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const auditsRef = collection(db, 'audits');
    const q = query(
      auditsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const auditsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        setAudits(auditsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser, limitCount]);

  // Save a new audit
  const save = useCallback(async (auditResults, urlData, domainInfo) => {
    try {
      const auditId = await saveAudit(auditResults, urlData, domainInfo);
      toast.success('Audit saved successfully!');
      return auditId;
    } catch (err) {
      toast.error(err.message || 'Failed to save audit');
      throw err;
    }
  }, []);

  // Delete an audit
  const remove = useCallback(async (auditId) => {
    try {
      await deleteAudit(auditId);
      toast.success('Audit deleted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to delete audit');
      throw err;
    }
  }, []);

  // Create a share link
  const share = useCallback(async (auditId, options) => {
    try {
      const result = await createShareLink(auditId, options);
      toast.success('Share link created!');
      return result;
    } catch (err) {
      toast.error(err.message || 'Failed to create share link');
      throw err;
    }
  }, []);

  // Revoke a share link
  const unshare = useCallback(async (auditId) => {
    try {
      await revokeShareLink(auditId);
      toast.success('Share link revoked');
    } catch (err) {
      toast.error(err.message || 'Failed to revoke share link');
      throw err;
    }
  }, []);

  // Get audit stats
  const stats = {
    total: audits.length,
    avgHealthScore: audits.length > 0
      ? Math.round(audits.reduce((sum, a) => sum + (a.healthScore || 0), 0) / audits.length)
      : 0,
    totalIssues: audits.reduce((sum, a) => sum + (a.issueCount || 0), 0),
    totalUrls: audits.reduce((sum, a) => sum + (a.urlCount || 0), 0),
    recentAudits: audits.slice(0, 5)
  };

  return {
    audits,
    loading,
    error,
    stats,
    save,
    remove,
    share,
    unshare,
    refresh: () => getUserAudits(limitCount).then(setAudits)
  };
}

export default useAudits;
