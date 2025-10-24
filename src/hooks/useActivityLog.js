import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useActivityLog(projectId, limit = 50) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'activity_log'),
      where('projectId', '==', projectId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs
        .slice(0, limit)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      setActivities(activitiesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, limit]);

  return { activities, loading };
}

export async function logActivity(projectId, userId, userName, action, details = {}) {
  try {
    await addDoc(collection(db, 'activity_log'), {
      projectId,
      userId,
      userName,
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
