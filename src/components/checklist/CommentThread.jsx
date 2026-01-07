import { useState } from 'react';
import { Send, Trash2, Edit2, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

export default function CommentThread({ comments, loading, onAddComment }) {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // Extract mentions from comment text
      const mentions = extractMentions(newComment);
      await onAddComment(newComment, isInternal, mentions);
      setNewComment('');
      setIsInternal(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const extractMentions = (text) => {
    // Simple @mention extraction - in production, you'd want better user selection
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / 60000);

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment... (Use @username to mention someone)"
            className="input min-h-[100px]"
            rows={3}
          />
          <p className="text-xs text-charcoal-500 mt-1">
            Tip: Use @username to mention team members
          </p>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-charcoal-200 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-charcoal-700">Internal note (hidden from clients)</span>
          </label>

          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="btn btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-4 border-t">
        {comments.length === 0 ? (
          <p className="text-center text-charcoal-500 py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                {comment.userAvatar ? (
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary-600" />
                )}
              </div>

              <div className="flex-1">
                <div className="bg-charcoal-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-charcoal-900">{comment.userName}</span>
                      <span className="text-charcoal-500 text-xs ml-2">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                      {comment.isInternal && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                          Internal
                        </span>
                      )}
                    </div>
                    {comment.userId === currentUser?.uid && (
                      <div className="flex gap-1">
                        <button
                          className="p-1 text-charcoal-400 hover:text-charcoal-600"
                          aria-label="Edit comment"
                        >
                          <Edit2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          className="p-1 text-charcoal-400 hover:text-red-600"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-charcoal-700 text-sm whitespace-pre-wrap">
                    {highlightMentions(comment.text)}
                  </p>

                  {comment.updatedAt && (
                    <p className="text-xs text-charcoal-400 mt-2">
                      (edited)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Helper to highlight @mentions in comments
function highlightMentions(text) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span key={index} className="text-primary-600 font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
}
