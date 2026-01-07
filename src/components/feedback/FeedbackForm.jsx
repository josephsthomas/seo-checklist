import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X,
  Send,
  Bug,
  Lightbulb,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Upload,
  Trash2,
  Monitor,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

const FEEDBACK_TYPES = [
  {
    id: 'bug',
    label: 'Bug Report',
    icon: Bug,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Something isn\'t working correctly'
  },
  {
    id: 'enhancement',
    label: 'Enhancement',
    icon: Lightbulb,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Suggest an improvement or new feature'
  },
  {
    id: 'general',
    label: 'General Feedback',
    icon: MessageSquare,
    color: 'text-primary-500',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    description: 'Share your thoughts or questions'
  }
];

const PRIORITY_LEVELS = [
  { id: 'low', label: 'Low', description: 'Minor issue, not blocking work', color: 'text-emerald-600' },
  { id: 'medium', label: 'Medium', description: 'Causes inconvenience but has workaround', color: 'text-amber-600' },
  { id: 'high', label: 'High', description: 'Significantly impacts work', color: 'text-orange-600' },
  { id: 'critical', label: 'Critical', description: 'Completely blocks work, needs immediate attention', color: 'text-red-600' }
];

const BROWSER_NAMES = {
  chrome: 'Chrome',
  firefox: 'Firefox',
  safari: 'Safari',
  edge: 'Edge',
  opera: 'Opera',
  unknown: 'Unknown'
};

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'unknown';
  let version = '';

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Firefox')) {
    browser = 'firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Edg')) {
    browser = 'edge';
    version = ua.match(/Edg\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'opera';
    version = ua.match(/(?:Opera|OPR)\/(\d+)/)?.[1] || '';
  }

  return {
    browser,
    browserName: BROWSER_NAMES[browser],
    version,
    os: getOS(),
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    userAgent: ua
  };
}

function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

export default function FeedbackForm({ isOpen, onClose }) {
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();

  const [feedbackType, setFeedbackType] = useState('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [useCase, setUseCase] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [contactEmail, setContactEmail] = useState('');
  const [allowContact, setAllowContact] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [systemInfo] = useState(() => getBrowserInfo());

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (currentUser?.email) {
      setContactEmail(currentUser.email);
    }
  }, [currentUser]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setFeedbackType('bug');
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStepsToReproduce('');
        setExpectedBehavior('');
        setActualBehavior('');
        setUseCase('');
        setScreenshot(null);
        setScreenshotPreview(null);
        setAllowContact(false);
        setIsSubmitted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle screenshot upload
  const handleScreenshotChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removeScreenshot = useCallback(() => {
    setScreenshot(null);
    setScreenshotPreview(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl = null;

      // Upload screenshot if provided
      if (screenshot) {
        const screenshotRef = ref(
          storage,
          `feedback-screenshots/${Date.now()}-${screenshot.name}`
        );
        await uploadBytes(screenshotRef, screenshot);
        screenshotUrl = await getDownloadURL(screenshotRef);
      }

      // Build feedback document
      const feedbackData = {
        type: feedbackType,
        title: title.trim(),
        description: description.trim(),
        page: location.pathname,
        pageUrl: window.location.href,

        // System info
        browser: systemInfo.browserName,
        browserVersion: systemInfo.version,
        os: systemInfo.os,
        screenSize: systemInfo.screenSize,
        viewportSize: systemInfo.viewportSize,
        userAgent: systemInfo.userAgent,

        // User info
        userId: currentUser?.uid || null,
        userEmail: allowContact ? contactEmail : null,
        userName: userProfile?.name || null,
        allowContact,

        // Screenshot
        screenshotUrl,

        // Metadata
        createdAt: serverTimestamp(),
        status: 'new',
        source: 'footer-form'
      };

      // Add type-specific fields
      if (feedbackType === 'bug') {
        feedbackData.priority = priority;
        feedbackData.stepsToReproduce = stepsToReproduce.trim() || null;
        feedbackData.expectedBehavior = expectedBehavior.trim() || null;
        feedbackData.actualBehavior = actualBehavior.trim() || null;
      } else if (feedbackType === 'enhancement') {
        feedbackData.useCase = useCase.trim() || null;
      }

      await addDoc(collection(db, 'feedback'), feedbackData);

      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-form-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-charcoal-200">
            <div>
              <h2 id="feedback-form-title" className="text-xl font-bold text-charcoal-900">
                Submit Feedback
              </h2>
              <p className="text-sm text-charcoal-500 mt-1">
                Help us improve Content Strategy Portal
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
              aria-label="Close feedback form"
            >
              <X className="w-5 h-5 text-charcoal-500" />
            </button>
          </div>

          {isSubmitted ? (
            /* Success State */
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-charcoal-900 mb-3">Thank You!</h3>
              <p className="text-charcoal-600 mb-8 max-w-md mx-auto">
                Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
              </p>
              <button onClick={onClose} className="btn btn-primary">
                Close
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Feedback Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-3">
                  What type of feedback?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FEEDBACK_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        feedbackType === type.id
                          ? `${type.borderColor} ${type.bgColor}`
                          : 'border-charcoal-200 hover:border-charcoal-300 bg-white'
                      }`}
                    >
                      <type.icon className={`w-6 h-6 ${type.color}`} />
                      <span className="text-sm font-medium text-charcoal-900">{type.label}</span>
                      <span className="text-xs text-charcoal-500 text-center">{type.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="feedback-title" className="block text-sm font-semibold text-charcoal-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="feedback-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    feedbackType === 'bug'
                      ? "Brief description of the bug"
                      : feedbackType === 'enhancement'
                        ? "Name your feature or improvement"
                        : "What's on your mind?"
                  }
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  maxLength={200}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="feedback-description" className="block text-sm font-semibold text-charcoal-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    feedbackType === 'bug'
                      ? "Describe what happened..."
                      : feedbackType === 'enhancement'
                        ? "Describe the feature or improvement you'd like to see..."
                        : "Share your feedback in detail..."
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Bug-specific fields */}
              {feedbackType === 'bug' && (
                <>
                  {/* Priority */}
                  <div>
                    <label htmlFor="feedback-priority" className="block text-sm font-semibold text-charcoal-700 mb-2">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        id="feedback-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-4 py-3 border border-charcoal-300 rounded-xl text-charcoal-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        {PRIORITY_LEVELS.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.label} - {level.description}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Steps to Reproduce */}
                  <div>
                    <label htmlFor="feedback-steps" className="block text-sm font-semibold text-charcoal-700 mb-2">
                      Steps to Reproduce <span className="text-charcoal-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="feedback-steps"
                      value={stepsToReproduce}
                      onChange={(e) => setStepsToReproduce(e.target.value)}
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                      rows={3}
                      className="w-full px-4 py-3 border border-charcoal-300 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                    />
                  </div>

                  {/* Expected vs Actual */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="feedback-expected" className="block text-sm font-semibold text-charcoal-700 mb-2">
                        Expected Behavior <span className="text-charcoal-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        id="feedback-expected"
                        value={expectedBehavior}
                        onChange={(e) => setExpectedBehavior(e.target.value)}
                        placeholder="What should have happened?"
                        rows={2}
                        className="w-full px-4 py-3 border border-charcoal-300 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="feedback-actual" className="block text-sm font-semibold text-charcoal-700 mb-2">
                        Actual Behavior <span className="text-charcoal-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        id="feedback-actual"
                        value={actualBehavior}
                        onChange={(e) => setActualBehavior(e.target.value)}
                        placeholder="What actually happened?"
                        rows={2}
                        className="w-full px-4 py-3 border border-charcoal-300 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Enhancement-specific fields */}
              {feedbackType === 'enhancement' && (
                <div>
                  <label htmlFor="feedback-usecase" className="block text-sm font-semibold text-charcoal-700 mb-2">
                    Use Case <span className="text-charcoal-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="feedback-usecase"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="How would this feature help you? What problem would it solve?"
                    rows={3}
                    className="w-full px-4 py-3 border border-charcoal-300 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
              )}

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                  Screenshot <span className="text-charcoal-400 font-normal">(optional)</span>
                </label>
                {screenshotPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="max-h-40 rounded-lg border border-charcoal-200"
                    />
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      aria-label="Remove screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-charcoal-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/50 cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-charcoal-400" />
                    <span className="text-charcoal-600">
                      Click to upload screenshot <span className="text-charcoal-400">(max 5MB)</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Contact Permission */}
              <div className="bg-charcoal-50 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowContact}
                    onChange={(e) => setAllowContact(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary-600 border-charcoal-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-charcoal-700">
                      Allow follow-up contact
                    </span>
                    <p className="text-xs text-charcoal-500 mt-1">
                      We may reach out if we need more information about your feedback
                    </p>
                  </div>
                </label>
                {allowContact && (
                  <div className="mt-3 ml-7">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* System Info Display */}
              <div className="bg-charcoal-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-charcoal-500" />
                  <span className="text-sm font-medium text-charcoal-700">System Information</span>
                  <span className="text-xs text-charcoal-400">(automatically captured)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-charcoal-500">Browser:</span>
                    <span className="ml-1 text-charcoal-700">{systemInfo.browserName} {systemInfo.version}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-500">OS:</span>
                    <span className="ml-1 text-charcoal-700">{systemInfo.os}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-500">Screen:</span>
                    <span className="ml-1 text-charcoal-700">{systemInfo.screenSize}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-charcoal-500" />
                    <code className="text-charcoal-700 truncate">{location.pathname}</code>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>

              {/* Warning for bugs */}
              {feedbackType === 'bug' && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    For urgent issues affecting your work, please include as much detail as possible including
                    steps to reproduce the problem. Screenshots are very helpful for bug reports.
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
