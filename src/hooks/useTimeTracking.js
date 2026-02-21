/**
 * Time Tracking Hook
 * Manages time entries for checklist items
 * Phase 9 - Batch 5
 */

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/roles';
import toast from 'react-hot-toast';

export function useTimeTracking(projectId, itemId = null) {
  const [timeEntries, setTimeEntries] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();

  // Load time entries
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    let q = query(
      collection(db, 'time_entries'),
      where('projectId', '==', projectId)
    );

    if (itemId) {
      q = query(q, where('itemId', '==', itemId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate(),
        endTime: doc.data().endTime?.toDate()
      }));

      setTimeEntries(entries);

      // Find active timer for current user
      const active = entries.find(
        e => e.userId === currentUser?.uid && e.isActive
      );
      setActiveTimer(active || null);

      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, itemId, currentUser]);

  // Start timer
  const startTimer = async (itemId, notes = '') => {
    if (!projectId || !currentUser) return;

    // Check if already has active timer
    if (activeTimer) {
      toast.error('Please stop your current timer first');
      return;
    }

    try {
      const entry = {
        projectId,
        itemId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        startTime: new Date(),
        endTime: null,
        minutes: 0,
        notes,
        isActive: true,
        isManual: false,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'time_entries'), entry);
      toast.success('Timer started');

      return docRef.id;
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.error('Failed to start timer');
      throw error;
    }
  };

  // Stop timer
  const stopTimer = async (entryId = null) => {
    if (!currentUser) return;

    const timerToStop = entryId
      ? timeEntries.find(e => e.id === entryId)
      : activeTimer;

    if (!timerToStop) {
      toast.error('No active timer found');
      return;
    }

    try {
      const endTime = new Date();
      const startTime = timerToStop.startTime;
      const minutes = Math.round((endTime - startTime) / 1000 / 60);

      await updateDoc(doc(db, 'time_entries', timerToStop.id), {
        endTime,
        minutes,
        isActive: false,
        updatedAt: serverTimestamp()
      });

      toast.success(`Timer stopped - ${minutes} minutes logged`);
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Failed to stop timer');
      throw error;
    }
  };

  // Add manual time entry
  const addManualEntry = async (itemId, minutes, notes = '') => {
    if (!projectId || !currentUser) return;

    try {
      const now = new Date();
      const entry = {
        projectId,
        itemId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        startTime: new Date(now.getTime() - minutes * 60000),
        endTime: now,
        minutes,
        notes,
        isActive: false,
        isManual: true,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'time_entries'), entry);
      toast.success(`${minutes} minutes logged`);
    } catch (error) {
      console.error('Error adding manual entry:', error);
      toast.error('Failed to log time');
      throw error;
    }
  };

  // Delete time entry (with ownership check, admin bypass, and confirmation)
  const deleteEntry = async (entryId) => {
    const entry = timeEntries.find(e => e.id === entryId);
    const userRole = userProfile?.role;
    if (entry && entry.userId !== currentUser?.uid && !hasPermission(userRole, 'canEditAllItems')) {
      toast.error('You can only delete your own time entries');
      return;
    }
    if (!window.confirm('Delete this time entry? This cannot be undone.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'time_entries', entryId));
      toast.success('Time entry deleted');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
      throw error;
    }
  };

  // Calculate total time for item
  const getTotalMinutes = (targetItemId) => {
    return timeEntries
      .filter(e => e.itemId === targetItemId && !e.isActive)
      .reduce((total, e) => total + (e.minutes || 0), 0);
  };

  // Format minutes to hours/minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Update a time entry (minutes and/or notes)
  const updateEntry = async (entryId, updates) => {
    const entry = timeEntries.find(e => e.id === entryId);
    const userRole = userProfile?.role;
    if (entry && entry.userId !== currentUser?.uid && !hasPermission(userRole, 'canEditAllItems')) {
      toast.error('You can only edit your own time entries');
      return;
    }
    try {
      await updateDoc(doc(db, 'time_entries', entryId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      toast.success('Time entry updated');
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry');
      throw error;
    }
  };

  return {
    timeEntries,
    activeTimer,
    loading,
    startTimer,
    stopTimer,
    addManualEntry,
    deleteEntry,
    updateEntry,
    getTotalMinutes,
    formatDuration
  };
}

export default useTimeTracking;
