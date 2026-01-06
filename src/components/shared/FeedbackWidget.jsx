import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquarePlus,
  X,
  Star,
  Send,
  Bug,
  Lightbulb,
  ThumbsUp,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Report Bug', icon: Bug, color: 'text-red-500' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'general', label: 'General Feedback', icon: ThumbsUp, color: 'text-emerald-500' }
];

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('general');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFeedbackType('general');
        setMessage('');
        setRating(0);
        setIsSubmitted(false);
      }, 300);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        type: feedbackType,
        message: message.trim(),
        rating: rating || null,
        page: location.pathname,
        userAgent: navigator.userAgent,
        userId: currentUser?.uid || 'anonymous',
        userEmail: currentUser?.email || null,
        userName: userProfile?.name || null,
        createdAt: serverTimestamp(),
        status: 'new'
      });

      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transition-all duration-200 group"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Feedback</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modal */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[90vw] max-w-md transform transition-all duration-300 ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-charcoal-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <MessageSquarePlus className="w-4 h-4 text-white" />
              </div>
              <h2 id="feedback-title" className="font-bold text-charcoal-900">Send Feedback</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
              aria-label="Close feedback form"
            >
              <X className="w-5 h-5 text-charcoal-500" />
            </button>
          </div>

          {isSubmitted ? (
            /* Success State */
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-charcoal-900 mb-2">Thank You!</h3>
              <p className="text-charcoal-600 mb-6">
                Your feedback helps us improve the Content Strategy Portal.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  What kind of feedback?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FEEDBACK_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        feedbackType === type.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      }`}
                    >
                      <type.icon className={`w-5 h-5 ${type.color}`} />
                      <span className="text-xs font-medium text-charcoal-700">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  How would you rate your experience?
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-charcoal-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-charcoal-500">
                    {rating > 0 ? `${rating}/5` : 'Optional'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="feedback-message" className="block text-sm font-medium text-charcoal-700 mb-2">
                  Your feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'bug'
                      ? "Describe the bug you encountered..."
                      : feedbackType === 'feature'
                        ? "Describe the feature you'd like to see..."
                        : "Tell us what you think..."
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Current Page Info */}
              <div className="flex items-center gap-2 text-xs text-charcoal-500">
                <span>Submitting from:</span>
                <code className="px-2 py-1 bg-charcoal-100 rounded font-mono">
                  {location.pathname}
                </code>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
