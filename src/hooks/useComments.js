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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useComments(projectId, itemId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!projectId || !itemId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'comments'),
      where('projectId', '==', projectId),
      where('itemId', '==', itemId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, itemId]);

  const addComment = async (text, isInternal = false, mentions = [], attachments = []) => {
    if (!currentUser) return;

    try {
      const commentData = {
        projectId,
        itemId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userAvatar: currentUser.photoURL || null,
        text,
        mentions,
        isInternal,
        attachments,
        createdAt: serverTimestamp(),
        updatedAt: null,
        editHistory: []
      };

      await addDoc(collection(db, 'comments'), commentData);
      toast.success('Comment added');

      // Create notifications for mentioned users
      if (mentions.length > 0) {
        await createMentionNotifications(mentions, projectId, itemId, text);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      throw error;
    }
  };

  const updateComment = async (commentId, newText) => {
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        text: newText,
        updatedAt: serverTimestamp()
      });
      toast.success('Comment updated');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
      throw error;
    }
  };

  return {
    comments,
    loading,
    addComment,
    updateComment,
    deleteComment
  };
}

async function createMentionNotifications(userIds, projectId, itemId, commentText) {
  const notificationsRef = collection(db, 'notifications');

  for (const userId of userIds) {
    try {
      await addDoc(notificationsRef, {
        userId,
        type: 'mentioned',
        title: 'You were mentioned in a comment',
        message: commentText.substring(0, 100),
        link: `/projects/${projectId}?itemId=${itemId}`,
        read: false,
        createdAt: serverTimestamp(),
        data: { projectId, itemId }
      });
    } catch (error) {
      console.error('Error creating mention notification:', error);
    }
  }
}
