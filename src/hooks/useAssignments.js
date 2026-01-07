import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { createNotification } from './useNotifications';
import { logActivity } from './useActivityLog';

export function useAssignments(projectId) {
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'checklist_assignments', `${projectId}_assignments`);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAssignments(docSnap.data());
      } else {
        setAssignments({});
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  const assignTask = async (itemId, userIds, dueDate = null, estimatedHours = null, startDate = null) => {
    if (!projectId || !currentUser) return;

    try {
      const docRef = doc(db, 'checklist_assignments', `${projectId}_assignments`);
      const assignmentData = {
        assignedTo: userIds,
        assignedBy: currentUser.uid,
        assignedAt: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        completedDate: null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        actualHours: null,
        status: 'not_started',
        notes: ''
      };

      // Update local state immediately
      setAssignments(prev => ({
        ...prev,
        [itemId]: assignmentData
      }));

      // Update in Firestore
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          [itemId]: assignmentData
        });
      } else {
        await setDoc(docRef, {
          [itemId]: assignmentData
        });
      }

      // Create notifications for assigned users
      for (const userId of userIds) {
        await createNotification(
          userId,
          'task_assigned',
          'New task assigned to you',
          `You have been assigned a task in project`,
          `/projects/${projectId}?itemId=${itemId}`,
          { projectId, itemId }
        );
      }

      // Log activity
      await logActivity(
        projectId,
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        'assigned_task',
        { itemId, assignedTo: userIds }
      );

      toast.success('Task assigned successfully');
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
      throw error;
    }
  };

  const updateTaskStatus = async (itemId, status) => {
    if (!projectId) return;

    try {
      const docRef = doc(db, 'checklist_assignments', `${projectId}_assignments`);
      const currentAssignment = assignments[itemId] || {};

      const updatedAssignment = {
        ...currentAssignment,
        status,
        updatedAt: new Date(),
        // Auto-set completedDate when status changes to completed
        completedDate: status === 'completed' ? new Date() : currentAssignment.completedDate
      };

      // Update local state
      setAssignments(prev => ({
        ...prev,
        [itemId]: updatedAssignment
      }));

      // Update in Firestore
      await updateDoc(docRef, {
        [itemId]: updatedAssignment
      });

      // Log activity
      await logActivity(
        projectId,
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        'updated_task_status',
        { itemId, status }
      );

      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      throw error;
    }
  };

  const unassignTask = async (itemId) => {
    if (!projectId) return;

    try {
      const docRef = doc(db, 'checklist_assignments', `${projectId}_assignments`);

      // Update local state
      setAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[itemId];
        return newAssignments;
      });

      // Update in Firestore
      await updateDoc(docRef, {
        [itemId]: null
      });

      toast.success('Task unassigned');
    } catch (error) {
      console.error('Error unassigning task:', error);
      toast.error('Failed to unassign task');
      throw error;
    }
  };

  const updateTimeline = async (itemId, timelineData) => {
    if (!projectId) return;

    try {
      const docRef = doc(db, 'checklist_assignments', `${projectId}_assignments`);
      const currentAssignment = assignments[itemId] || {};

      const updatedAssignment = {
        ...currentAssignment,
        ...timelineData,
        updatedAt: new Date()
      };

      // Update local state
      setAssignments(prev => ({
        ...prev,
        [itemId]: updatedAssignment
      }));

      // Update in Firestore
      await updateDoc(docRef, {
        [itemId]: updatedAssignment
      });

      // Log activity
      await logActivity(
        projectId,
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        'updated_timeline',
        { itemId, updates: Object.keys(timelineData) }
      );

      toast.success('Timeline updated');
    } catch (error) {
      console.error('Error updating timeline:', error);
      toast.error('Failed to update timeline');
      throw error;
    }
  };

  return {
    assignments,
    loading,
    assignTask,
    updateTaskStatus,
    unassignTask,
    updateTimeline
  };
}

// Hook to get tasks assigned to current user across all projects
export function useMyTasks() {
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // This is a simplified version - in production you'd want to index this better
    const q = query(
      collection(db, 'checklist_assignments')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = [];

      snapshot.docs.forEach(doc => {
        const projectId = doc.id.replace('_assignments', '');
        const assignments = doc.data();

        Object.entries(assignments).forEach(([itemId, assignment]) => {
          if (assignment?.assignedTo?.includes(currentUser.uid)) {
            tasks.push({
              projectId,
              itemId: parseInt(itemId, 10),
              ...assignment
            });
          }
        });
      });

      setMyTasks(tasks);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  return { myTasks, loading };
}
