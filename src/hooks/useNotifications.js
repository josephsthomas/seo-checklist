import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const { currentUser } = useAuth();
  const prevUnreadRef = useRef(0);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setNotifications(notificationsData);
      const newUnread = notificationsData.filter(n => !n.read).length;
      if (newUnread > prevUnreadRef.current) {
        setLiveAnnouncement(`You have ${newUnread} unread notification${newUnread !== 1 ? 's' : ''}`);
      }
      prevUnreadRef.current = newUnread;
      setUnreadCount(newUnread);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Notification listener error:', err);
      setError('Failed to load notifications');
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const BATCH_LIMIT = 500;

      for (let i = 0; i < unreadNotifications.length; i += BATCH_LIMIT) {
        const chunk = unreadNotifications.slice(i, i + BATCH_LIMIT);
        const batch = writeBatch(db);
        chunk.forEach(notification => {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        });
        await batch.commit();
      }

      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not mark notifications as read. Please try again.');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Could not delete notification');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    liveAnnouncement,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}

const NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error', 'assignment', 'comment', 'mention', 'due_date', 'project', 'system'];

export async function createNotification(userId, type, title, message, link, data = {}) {
  if (!NOTIFICATION_TYPES.includes(type)) {
    console.error(`Invalid notification type: "${type}". Must be one of: ${NOTIFICATION_TYPES.join(', ')}`);
    return;
  }
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      link,
      read: false,
      createdAt: serverTimestamp(),
      data
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}
