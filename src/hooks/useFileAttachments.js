/**
 * File Attachments Hook
 * Manages file uploads and attachments for checklist items
 * Phase 9 - Batch 6
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
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

export function useFileAttachments(projectId, itemId) {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load attachments
  useEffect(() => {
    if (!projectId || !itemId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'attachments'),
      where('projectId', '==', projectId),
      where('itemId', '==', itemId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const files = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate()
      }));

      setAttachments(files.sort((a, b) => b.uploadedAt - a.uploadedAt));
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, itemId]);

  // Validate file
  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('File type not allowed. Supported: images (JPEG, PNG, GIF, WebP), PDF, Word, Excel, and text files.');
      return false;
    }

    return true;
  };

  // Upload file
  const uploadFile = async (file, description = '') => {
    if (!projectId || !itemId || !currentUser) return;

    if (!validateFile(file)) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create storage reference
      const timestamp = Date.now();
      const filename = `${timestamp}_${file.name}`;
      const storagePath = `projects/${projectId}/items/${itemId}/${filename}`;
      const storageRef = ref(storage, storagePath);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
            setUploading(false);
            reject(error);
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Save metadata to Firestore
              const attachmentData = {
                projectId,
                itemId,
                filename: file.name,
                fileSize: file.size,
                fileType: file.type,
                storagePath,
                downloadURL,
                description,
                uploadedBy: currentUser.uid,
                uploadedByName: currentUser.displayName || currentUser.email,
                uploadedAt: serverTimestamp()
              };

              const docRef = await addDoc(collection(db, 'attachments'), attachmentData);

              toast.success('File uploaded successfully');
              setUploading(false);
              setUploadProgress(0);
              resolve(docRef.id);
            } catch (error) {
              console.error('Error saving metadata:', error);
              toast.error('Failed to save file metadata');
              setUploading(false);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      setUploading(false);
      throw error;
    }
  };

  // Delete file (with confirmation — files cannot be restored from Storage)
  const deleteFile = async (attachmentId) => {
    try {
      const attachment = attachments.find(a => a.id === attachmentId);
      if (!attachment) return;

      // Ownership check: only the uploader can delete
      if (attachment.uploadedBy !== currentUser?.uid) {
        toast.error('You can only delete files you uploaded');
        return;
      }

      if (!window.confirm(`Delete "${attachment.filename}"? This cannot be undone.`)) {
        return;
      }

      // Delete from storage
      const storageRef = ref(storage, attachment.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'attachments', attachmentId));

      toast.success('File deleted');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
      throw error;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'file-text';
    if (fileType.includes('word')) return 'file-text';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table';
    return 'file';
  };

  return {
    attachments,
    loading,
    uploading,
    uploadProgress,
    uploadFile,
    deleteFile,
    formatFileSize,
    getFileIcon,
    MAX_FILE_SIZE
  };
}

export default useFileAttachments;
