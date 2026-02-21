import { useState, useEffect, useCallback, useMemo } from 'react';
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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { isAfter, isBefore, addDays, startOfDay, differenceInDays } from 'date-fns';

/**
 * Supported due date types
 */
export const DUE_DATE_TYPES = ['task', 'project', 'reminder', 'content_review', 'content_publish', 'content_archive', 'content_expire'];

/**
 * Hook for managing due dates and reminders
 */
export function useDueDates() {
  const [dueDates, setDueDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setDueDates([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'due_dates'),
      where('userId', '==', currentUser.uid),
      orderBy('dueDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate ? doc.data().dueDate.toDate() : new Date(doc.data().dueDate)
      }));
      setDueDates(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Add a due date/reminder
  const addDueDate = useCallback(async (data) => {
    if (!currentUser) return null;

    try {
      const docRef = await addDoc(collection(db, 'due_dates'), {
        userId: currentUser.uid,
        title: data.title,
        description: data.description || '',
        dueDate: Timestamp.fromDate(new Date(data.dueDate)),
        type: data.type || 'task', // task, project, reminder, content_review
        priority: data.priority || 'medium',
        projectId: data.projectId || null,
        itemId: data.itemId || null,
        completed: false,
        reminderSent: false,
        reminderDaysBefore: data.reminderDaysBefore || 1,
        createdAt: serverTimestamp()
      });

      toast.success('Due date added');
      return docRef.id;
    } catch (error) {
      console.error('Error adding due date:', error);
      toast.error('Failed to add due date');
      return null;
    }
  }, [currentUser]);

  // Update a due date
  const updateDueDate = useCallback(async (id, updates) => {
    try {
      const docRef = doc(db, 'due_dates', id);
      const processedUpdates = { ...updates };

      if (updates.dueDate) {
        processedUpdates.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
      }

      await updateDoc(docRef, processedUpdates);
      toast.success('Due date updated');
    } catch (error) {
      console.error('Error updating due date:', error);
      toast.error('Failed to update due date');
    }
  }, []);

  // Delete a due date
  const deleteDueDate = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'due_dates', id));
      toast.success('Due date removed');
    } catch (error) {
      console.error('Error deleting due date:', error);
      toast.error('Failed to delete due date');
    }
  }, []);

  // Mark as complete
  const markComplete = useCallback(async (id) => {
    try {
      const docRef = doc(db, 'due_dates', id);
      await updateDoc(docRef, {
        completed: true,
        completedAt: serverTimestamp()
      });
      toast.success('Due date marked as complete');
    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Failed to mark due date as complete');
    }
  }, []);

  // Computed values
  const overdue = useMemo(() => {
    const now = startOfDay(new Date());
    return dueDates.filter(d => !d.completed && isBefore(d.dueDate, now));
  }, [dueDates]);

  const dueToday = useMemo(() => {
    const today = startOfDay(new Date());
    const tomorrow = startOfDay(addDays(new Date(), 1));
    return dueDates.filter(d =>
      !d.completed &&
      isAfter(d.dueDate, today) &&
      isBefore(d.dueDate, tomorrow)
    );
  }, [dueDates]);

  const dueThisWeek = useMemo(() => {
    const tomorrow = startOfDay(addDays(new Date(), 1));
    const nextWeek = startOfDay(addDays(new Date(), 7));
    return dueDates.filter(d =>
      !d.completed &&
      isAfter(d.dueDate, tomorrow) &&
      isBefore(d.dueDate, nextWeek)
    );
  }, [dueDates]);

  const upcoming = useMemo(() => {
    const nextWeek = startOfDay(addDays(new Date(), 7));
    return dueDates.filter(d =>
      !d.completed &&
      isAfter(d.dueDate, nextWeek)
    );
  }, [dueDates]);

  return {
    dueDates,
    loading,
    addDueDate,
    updateDueDate,
    deleteDueDate,
    markComplete,
    // Categorized
    overdue,
    dueToday,
    dueThisWeek,
    upcoming
  };
}

/**
 * Calculate urgency level for a due date
 */
export function getDueDateUrgency(dueDate) {
  const now = new Date();
  const days = differenceInDays(dueDate, now);

  if (days < 0) return { level: 'overdue', label: 'Overdue', color: 'red', ariaLabel: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}` };
  if (days === 0) return { level: 'today', label: 'Today', color: 'amber', ariaLabel: 'Due today' };
  if (days === 1) return { level: 'tomorrow', label: 'Tomorrow', color: 'orange', ariaLabel: 'Due tomorrow' };
  if (days <= 3) return { level: 'soon', label: `${days} days`, color: 'orange', ariaLabel: `Due in ${days} days — soon` };
  if (days <= 7) return { level: 'week', label: `${days} days`, color: 'blue', ariaLabel: `Due in ${days} days — this week` };
  return { level: 'future', label: `${days} days`, color: 'gray', ariaLabel: `Due in ${days} days` };
}

export default useDueDates;
