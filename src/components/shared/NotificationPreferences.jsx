import { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Settings,
  ClipboardList,
  MessageSquare,
  Clock,
  AlertTriangle,
  Trophy,
  Reply,
  Mail,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

// Notification types configuration
const NOTIFICATION_TYPES = [
  {
    id: 'task_assigned',
    label: 'Task Assignments',
    description: 'When a task is assigned to you',
    icon: ClipboardList,
    category: 'Tasks'
  },
  {
    id: 'mentioned',
    label: 'Mentions',
    description: 'When someone mentions you in a comment',
    icon: MessageSquare,
    category: 'Collaboration'
  },
  {
    id: 'task_overdue',
    label: 'Overdue Reminders',
    description: 'When your tasks are past due date',
    icon: Clock,
    category: 'Tasks'
  },
  {
    id: 'blocker_alert',
    label: 'Blocker Alerts',
    description: 'When a blocking issue needs attention',
    icon: AlertTriangle,
    category: 'Tasks'
  },
  {
    id: 'project_milestone',
    label: 'Project Milestones',
    description: 'When projects reach completion milestones',
    icon: Trophy,
    category: 'Projects'
  },
  {
    id: 'comment_reply',
    label: 'Comment Replies',
    description: 'When someone replies to your comments',
    icon: Reply,
    category: 'Collaboration'
  },
  {
    id: 'audit_completed',
    label: 'Audit Completed',
    description: 'When a scheduled audit finishes running',
    icon: ClipboardList,
    category: 'Content'
  },
  {
    id: 'content_review_due',
    label: 'Content Review Due',
    description: 'When content reaches its scheduled review date',
    icon: Clock,
    category: 'Content'
  }
];

// Default preferences
const DEFAULT_PREFERENCES = {
  enabled: true,
  sound: true,
  types: {
    task_assigned: true,
    mentioned: true,
    task_overdue: true,
    blocker_alert: true,
    project_milestone: true,
    comment_reply: true,
    audit_completed: true,
    content_review_due: true
  },
  email: {
    enabled: false,
    digest: 'daily' // 'instant', 'daily', 'weekly', 'never'
  }
};

export default function NotificationPreferences({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences from Firestore
  useEffect(() => {
    async function loadPreferences() {
      if (!currentUser?.uid || !isOpen) return;

      try {
        const docRef = doc(db, 'users', currentUser.uid, 'settings', 'notifications');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [currentUser, isOpen]);

  // Save preferences to Firestore
  const savePreferences = async () => {
    if (!currentUser?.uid) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'settings', 'notifications');
      await setDoc(docRef, preferences, { merge: true });
      toast.success('Notification preferences saved');
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleType = (typeId) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [typeId]: !prev.types[typeId]
      }
    }));
  };

  const toggleAll = (enabled) => {
    const newTypes = {};
    NOTIFICATION_TYPES.forEach(type => {
      newTypes[type.id] = enabled;
    });
    setPreferences(prev => ({
      ...prev,
      types: newTypes
    }));
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group notifications by category
  const categories = NOTIFICATION_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) acc[type.category] = [];
    acc[type.category].push(type);
    return acc;
  }, {});

  const allEnabled = Object.values(preferences.types).every(v => v);
  const noneEnabled = Object.values(preferences.types).every(v => !v);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prefs-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50 to-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal-600 to-charcoal-800 flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="prefs-title" className="text-xl font-bold text-charcoal-900">Notification Preferences</h2>
              <p className="text-sm text-charcoal-500">Customize how you receive alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-charcoal-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-charcoal-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-charcoal-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-charcoal-600" />
                  <div>
                    <p className="font-medium text-charcoal-900">Enable Notifications</p>
                    <p className="text-sm text-charcoal-500">Receive in-app notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.enabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-charcoal-300 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
                </label>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {preferences.sound ? (
                    <Volume2 className="w-5 h-5 text-charcoal-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-charcoal-600" />
                  )}
                  <div>
                    <p className="font-medium text-charcoal-900">Notification Sounds</p>
                    <p className="text-sm text-charcoal-500">Play sound for new notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.sound}
                    onChange={(e) => setPreferences(prev => ({ ...prev, sound: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-charcoal-300 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
                </label>
              </div>

              {/* Quick Toggle All */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-charcoal-600">Notification Types</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAll(true)}
                    className={`text-xs px-2 py-1 rounded ${allEnabled ? 'bg-primary-100 text-primary-700' : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'}`}
                  >
                    All On
                  </button>
                  <button
                    onClick={() => toggleAll(false)}
                    className={`text-xs px-2 py-1 rounded ${noneEnabled ? 'bg-charcoal-200 text-charcoal-700' : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'}`}
                  >
                    All Off
                  </button>
                </div>
              </div>

              {/* Notification Types by Category */}
              {Object.entries(categories).map(([category, types]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {types.map(type => {
                      const Icon = type.icon;
                      const isEnabled = preferences.types[type.id];

                      return (
                        <button
                          key={type.id}
                          onClick={() => toggleType(type.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            isEnabled
                              ? 'border-primary-200 bg-primary-50'
                              : 'border-charcoal-200 bg-white hover:bg-charcoal-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isEnabled ? 'bg-primary-100' : 'bg-charcoal-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${isEnabled ? 'text-primary-600' : 'text-charcoal-500'}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`font-medium ${isEnabled ? 'text-charcoal-900' : 'text-charcoal-600'}`}>
                              {type.label}
                            </p>
                            <p className="text-sm text-charcoal-500">{type.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isEnabled
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-charcoal-300'
                          }`}>
                            {isEnabled && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Email Preferences */}
              <div className="pt-4 border-t border-charcoal-200">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-charcoal-600" />
                  <div>
                    <p className="font-medium text-charcoal-900">Email Notifications</p>
                    <p className="text-sm text-charcoal-500">Receive notifications via email</p>
                  </div>
                </div>

                <select
                  value={preferences.email.digest}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    email: { ...prev.email, digest: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="never">Never send emails</option>
                  <option value="instant">Instant - As they happen</option>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly summary</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-charcoal-100 bg-charcoal-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={savePreferences}
            disabled={saving || loading}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Settings button to open preferences from notification panel
 */
export function NotificationSettingsButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 hover:bg-charcoal-100 rounded-lg transition-colors"
      title="Notification settings"
      aria-label="Open notification settings"
    >
      <Settings className="w-4 h-4 text-charcoal-500" />
    </button>
  );
}
