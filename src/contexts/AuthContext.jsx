import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register user with email/password
  const signup = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(user, { displayName });

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: displayName,
        role: 'content_writer', // Default role (least privilege)
        createdAt: new Date(),
        avatar: null,
        emailVerified: false
      });

      toast.success('Account created! Please check your email to verify your account.');
      return user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Sign in with email/password
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName,
          role: 'content_writer',
          createdAt: new Date(),
          avatar: user.photoURL,
          emailVerified: true // Google accounts are already verified
        });
      }

      toast.success('Logged in with Google successfully!');
      return user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        toast.success('Verification email sent! Please check your inbox.');
        return true;
      } else if (currentUser?.emailVerified) {
        toast.success('Your email is already verified!');
        return true;
      }
    } catch (error) {
      if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please wait a few minutes and try again.');
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
      throw error;
    }
  };

  // Delete user account and all associated data
  const deleteAccount = async (password) => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Re-authenticate the user before deletion
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      const userId = currentUser.uid;

      // Delete user's projects and related data
      const batch = writeBatch(db);

      // Delete user's projects
      const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', userId));
      const projectsSnapshot = await getDocs(projectsQuery);
      projectsSnapshot.forEach((projectDoc) => {
        batch.delete(projectDoc.ref);
      });

      // Delete user's checklist assignments
      const assignmentsQuery = query(collection(db, 'checklist_assignments'), where('assignedBy', '==', userId));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      assignmentsSnapshot.forEach((assignmentDoc) => {
        batch.delete(assignmentDoc.ref);
      });

      // Delete user's time entries
      const timeEntriesQuery = query(collection(db, 'time_entries'), where('userId', '==', userId));
      const timeEntriesSnapshot = await getDocs(timeEntriesQuery);
      timeEntriesSnapshot.forEach((timeDoc) => {
        batch.delete(timeDoc.ref);
      });

      // Delete user's comments
      const commentsQuery = query(collection(db, 'comments'), where('userId', '==', userId));
      const commentsSnapshot = await getDocs(commentsQuery);
      commentsSnapshot.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });

      // Delete user's notifications
      const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      notificationsSnapshot.forEach((notifDoc) => {
        batch.delete(notifDoc.ref);
      });

      // Delete user's notification settings
      const notificationSettingsRef = doc(db, 'users', userId, 'settings', 'notifications');
      batch.delete(notificationSettingsRef);

      // Delete user profile
      const userRef = doc(db, 'users', userId);
      batch.delete(userRef);

      // Execute batch delete
      await batch.commit();

      // Delete user's files from storage
      try {
        const userStorageRef = ref(storage, `users/${userId}`);
        const files = await listAll(userStorageRef);
        await Promise.all(files.items.map(file => deleteObject(file)));
      } catch (storageError) {
        console.warn('Failed to delete user storage files:', storageError);
      }

      // Delete Firebase Auth user
      await deleteUser(currentUser);

      setUserProfile(null);
      toast.success('Your account has been permanently deleted.');
      return true;
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in before deleting your account.');
      } else {
        toast.error('Failed to delete account. Please try again.');
      }
      throw error;
    }
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile({ id: uid, ...docSnap.data() });
      }
    } catch (profileError) {
      console.warn('Failed to fetch user profile:', profileError);
    }
  };

  // Refresh user to get updated emailVerified status
  const refreshUser = async () => {
    if (currentUser) {
      await currentUser.reload();
      setCurrentUser({ ...auth.currentUser });

      // Update emailVerified in Firestore if changed
      if (currentUser.emailVerified) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { emailVerified: true }, { merge: true });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    resendVerificationEmail,
    deleteAccount,
    refreshUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
