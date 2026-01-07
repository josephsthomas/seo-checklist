/**
 * File Upload Component
 * Drag-and-drop file upload with preview and management
 * Phase 9 - Batch 6
 */

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, FileText, Image, Table, Trash2, Download, Loader } from 'lucide-react';
import { useFileAttachments } from '../../hooks/useFileAttachments';
import { format } from 'date-fns';

export default function FileUpload({ projectId, itemId }) {
  const {
    attachments,
    loading,
    uploading,
    uploadProgress,
    uploadFile,
    deleteFile,
    formatFileSize,
    MAX_FILE_SIZE
  } = useFileAttachments(projectId, itemId);

  const [description, setDescription] = useState('');

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0]; // Handle one file at a time
    await uploadFile(file, description);
    setDescription('');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    }
  });

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-600" />;
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5 text-red-600" />;
    if (fileType.includes('word')) return <FileText className="w-5 h-5 text-blue-700" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet'))
      return <Table className="w-5 h-5 text-green-600" />;
    return <File className="w-5 h-5 text-charcoal-600" />;
  };

  const handleDelete = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await deleteFile(attachmentId);
    }
  };

  if (loading) {
    return <div className="text-sm text-charcoal-500">Loading attachments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-charcoal-200 hover:border-charcoal-300 bg-charcoal-50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={uploading} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-charcoal-400" />
          {isDragActive ? (
            <p className="text-sm text-blue-600 font-medium">Drop file here...</p>
          ) : (
            <>
              <p className="text-sm text-charcoal-600 mb-1">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-charcoal-500">
                Images, PDF, Word, Excel, Text (max {MAX_FILE_SIZE / 1024 / 1024}MB)
              </p>
            </>
          )}
        </div>

        {/* Description Input */}
        <div className="mt-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="File description (optional)"
            className="input w-full text-sm"
            disabled={uploading}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-charcoal-600 mb-2">
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-charcoal-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-charcoal-900 mb-3">
            Attachments ({attachments.length})
          </h5>
          <div className="space-y-2">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-start gap-3 p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
              >
                {/* File Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getFileIcon(attachment.fileType)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-900 truncate">
                        {attachment.filename}
                      </p>
                      {attachment.description && (
                        <p className="text-xs text-charcoal-600 mt-0.5">{attachment.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-charcoal-500">
                    <span>{formatFileSize(attachment.fileSize)}</span>
                    <span>•</span>
                    <span>{format(attachment.uploadedAt, 'MMM d, yyyy h:mm a')}</span>
                    <span>•</span>
                    <span>{attachment.uploadedByName}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={attachment.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-charcoal-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    aria-label={`Download ${attachment.filename}`}
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded"
                    aria-label={`Delete ${attachment.filename}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {attachments.length === 0 && (
        <div className="text-center py-6 text-charcoal-500 text-sm">
          No attachments yet. Upload files to get started.
        </div>
      )}
    </div>
  );
}
