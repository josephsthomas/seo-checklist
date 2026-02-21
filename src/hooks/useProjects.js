import { useState, useEffect } from 'react';
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
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/roles';
import { logAuditEvent } from '../utils/auditLog';
import { cascadeDeleteProject } from '../utils/cascadeDelete';
import toast from 'react-hot-toast';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'projects'),
      where('ownerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => !p.deletedAt);
      setProjects(projectsData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Projects listener error:', err);
      setError('Failed to load projects');
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const createProject = async (projectData) => {
    const userRole = userProfile?.role;
    if (!hasPermission(userRole, 'canCreateProjects')) {
      toast.error('You do not have permission to create projects');
      return null;
    }
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      logAuditEvent({ action: 'CREATE', targetType: 'Project', targetId: docRef.id, targetName: projectData.name });
      toast.success('Project created successfully!');
      return docRef.id;
    } catch (error) {
      toast.error('Failed to create project');
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        toast.error('Project not found');
        return;
      }
      const userRole = userProfile?.role;
      const projectData = projectSnap.data();
      // Only owner, team members, or users with canEditAllItems can update
      if (projectData.ownerId !== currentUser?.uid &&
          !projectData.teamMembers?.includes(currentUser?.uid) &&
          !hasPermission(userRole, 'canEditAllItems')) {
        toast.error('You do not have permission to update this project');
        return;
      }
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      logAuditEvent({ action: 'UPDATE', targetType: 'Project', targetId: projectId, targetName: projectData.name, details: { changes: Object.keys(updates) } });
      toast.success('Project updated successfully!');
    } catch (error) {
      toast.error('Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    const userRole = userProfile?.role || 'viewer';
    if (!hasPermission(userRole, 'canDeleteProjects')) {
      toast.error('You do not have permission to delete projects');
      return;
    }
    try {
      // Soft-delete: mark with deletedAt timestamp
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { deletedAt: serverTimestamp() });

      logAuditEvent({ action: 'DELETE', targetType: 'Project', targetId: projectId });

      // Schedule permanent delete after 6 seconds if not undone
      let undone = false;
      const deleteTimeout = setTimeout(async () => {
        if (!undone) {
          try {
            await cascadeDeleteProject(projectId);
            await deleteDoc(projectRef);
          } catch {
            // Already deleted or restored — ignore
          }
        }
      }, 6000);

      // Show undo toast using plain text (hooks are .js, not .jsx)
      toast('Project deleted. Click to undo.', {
        duration: 5000,
        onClick: async () => {
          undone = true;
          clearTimeout(deleteTimeout);
          await updateDoc(projectRef, { deletedAt: null });
          toast.success('Project restored');
        }
      });
    } catch (err) {
      toast.error('Failed to delete project');
      throw err;
    }
  };

  const getProject = async (projectId) => {
    try {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      console.error('Failed to get project:', err);
      toast.error('Failed to load project');
      return null;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProject
  };
}
