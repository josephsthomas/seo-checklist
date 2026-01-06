import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch any user's public profile data
 */
export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Use current user's ID if no userId provided
  const targetUserId = userId || currentUser?.uid;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const userDoc = await getDoc(doc(db, 'users', targetUserId));

        if (userDoc.exists()) {
          setProfile({
            id: targetUserId,
            ...userDoc.data()
          });
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId]);

  return { profile, loading, error, isOwnProfile: targetUserId === currentUser?.uid };
}

/**
 * Hook to fetch user's projects (public projects only for other users)
 */
export function useUserProjects(userId, limit = 10) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0
  });
  const { currentUser } = useAuth();

  const targetUserId = userId || currentUser?.uid;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);

      try {
        const q = query(
          collection(db, 'projects'),
          where('ownerId', '==', targetUserId),
          orderBy('createdAt', 'desc'),
          firestoreLimit(limit)
        );

        const snapshot = await getDocs(q);
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProjects(projectsData);

        // Calculate stats
        const completed = projectsData.filter(p => p.status === 'completed').length;
        setStats({
          total: projectsData.length,
          completed,
          inProgress: projectsData.filter(p => p.status === 'in_progress').length
        });
      } catch (err) {
        console.error('Error fetching user projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [targetUserId, limit]);

  return { projects, loading, stats };
}

/**
 * Hook to fetch user's activity stats
 */
export function useUserActivityStats(userId) {
  const [stats, setStats] = useState({
    totalActivities: 0,
    thisWeek: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const targetUserId = userId || currentUser?.uid;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);

      try {
        // Get all activities for this user
        const q = query(
          collection(db, 'activity_log'),
          where('userId', '==', targetUserId),
          orderBy('timestamp', 'desc'),
          firestoreLimit(100)
        );

        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data());

        // Calculate stats
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const thisWeek = activities.filter(a => {
          const timestamp = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          return timestamp > oneWeekAgo;
        }).length;

        // Count by type
        const byType = {};
        activities.forEach(a => {
          const type = a.type || 'unknown';
          byType[type] = (byType[type] || 0) + 1;
        });

        setStats({
          totalActivities: activities.length,
          thisWeek,
          byType
        });
      } catch (err) {
        console.error('Error fetching activity stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [targetUserId]);

  return { stats, loading };
}

/**
 * Hook to fetch teams the user is a member of
 */
export function useUserTeams(userId) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const targetUserId = userId || currentUser?.uid;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      setLoading(true);

      try {
        // Query projects where user is a team member
        const q = query(
          collection(db, 'projects'),
          where('team', 'array-contains', targetUserId)
        );

        const snapshot = await getDocs(q);

        // Get unique teams from projects
        const teamSet = new Map();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.team) {
            teamSet.set(doc.id, {
              projectId: doc.id,
              projectName: data.name,
              role: data.ownerId === targetUserId ? 'Owner' : 'Member'
            });
          }
        });

        setTeams(Array.from(teamSet.values()));
      } catch (err) {
        console.error('Error fetching user teams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [targetUserId]);

  return { teams, loading };
}

export default useUserProfile;
