import { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  Key,
  ChevronRight,
  Mail,
  Building,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import toast from 'react-hot-toast';
import NotificationPreferences from '../shared/NotificationPreferences';

// Settings sections
const SECTIONS = {
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  APPEARANCE: 'appearance',
  SECURITY: 'security'
};

export default function UserSettingsPage() {
  const { currentUser, userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState(SECTIONS.PROFILE);
  const [notificationPrefsOpen, setNotificationPrefsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    showTips: true
  });

  // Load user profile
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || currentUser?.displayName || '',
        email: currentUser?.email || '',
        company: userProfile.company || '',
        jobTitle: userProfile.jobTitle || ''
      });
    }

    // Load appearance settings
    const savedAppearance = localStorage.getItem('appearanceSettings');
    if (savedAppearance) {
      setAppearance(JSON.parse(savedAppearance));
    }
  }, [userProfile, currentUser]);

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: profileForm.name
      });

      // Update Firestore profile
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        name: profileForm.name,
        company: profileForm.company,
        jobTitle: profileForm.jobTitle,
        updatedAt: new Date()
      }, { merge: true });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordForm.newPassword);

      toast.success('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  // Save appearance settings
  const handleSaveAppearance = () => {
    localStorage.setItem('appearanceSettings', JSON.stringify(appearance));
    toast.success('Appearance settings saved');

    // Apply settings
    if (appearance.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  };

  const sections = [
    { id: SECTIONS.PROFILE, label: 'Profile', icon: User, description: 'Personal information' },
    { id: SECTIONS.NOTIFICATIONS, label: 'Notifications', icon: Bell, description: 'Alerts & reminders' },
    { id: SECTIONS.APPEARANCE, label: 'Appearance', icon: Palette, description: 'Display preferences' },
    { id: SECTIONS.SECURITY, label: 'Security', icon: Shield, description: 'Password & access' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-charcoal-600 to-charcoal-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900">Settings</h1>
              <p className="text-charcoal-500">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-50 border-l-4 border-primary-500'
                      : 'hover:bg-charcoal-50 border-l-4 border-transparent'
                  }`}
                >
                  <section.icon className={`w-5 h-5 ${
                    activeSection === section.id ? 'text-primary-600' : 'text-charcoal-400'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-medium ${
                      activeSection === section.id ? 'text-primary-700' : 'text-charcoal-700'
                    }`}>
                      {section.label}
                    </p>
                    <p className="text-xs text-charcoal-500">{section.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
              {/* Profile Section */}
              {activeSection === SECTIONS.PROFILE && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Profile Information</h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                        <User className="w-10 h-10 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-900">{profileForm.name || 'User'}</p>
                        <p className="text-sm text-charcoal-500">{profileForm.email}</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="profile-name" className="block text-sm font-medium text-charcoal-700 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" aria-hidden="true" />
                          <input
                            id="profile-name"
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                            className="input pl-10"
                            placeholder="Your name"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="profile-email" className="block text-sm font-medium text-charcoal-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" aria-hidden="true" />
                          <input
                            id="profile-email"
                            type="email"
                            value={profileForm.email}
                            disabled
                            aria-describedby="email-note"
                            className="input pl-10 bg-charcoal-50 text-charcoal-500 cursor-not-allowed"
                          />
                        </div>
                        <p id="email-note" className="text-xs text-charcoal-400 mt-1">Email cannot be changed</p>
                      </div>

                      <div className="form-group">
                        <label htmlFor="profile-company" className="block text-sm font-medium text-charcoal-700 mb-1">
                          Company
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" aria-hidden="true" />
                          <input
                            id="profile-company"
                            type="text"
                            value={profileForm.company}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                            className="input pl-10"
                            placeholder="Your company"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="profile-job-title" className="block text-sm font-medium text-charcoal-700 mb-1">
                          Job Title
                        </label>
                        <input
                          id="profile-job-title"
                          type="text"
                          value={profileForm.jobTitle}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                          className="input"
                          placeholder="Your role"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-charcoal-100">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* Notifications Section */}
              {activeSection === SECTIONS.NOTIFICATIONS && (
                <div>
                  <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Notification Settings</h2>
                  <p className="text-charcoal-500 mb-6">
                    Choose how and when you want to be notified about updates.
                  </p>

                  <button
                    onClick={() => setNotificationPrefsOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-charcoal-50 rounded-xl hover:bg-charcoal-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-charcoal-500" />
                      <div className="text-left">
                        <p className="font-medium text-charcoal-900">Notification Preferences</p>
                        <p className="text-sm text-charcoal-500">Manage types and delivery</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-charcoal-400" />
                  </button>
                </div>
              )}

              {/* Appearance Section */}
              {activeSection === SECTIONS.APPEARANCE && (
                <div>
                  <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Appearance</h2>

                  <div className="space-y-4">
                    {/* Theme Selection */}
                    <div className="p-4 bg-charcoal-50 rounded-xl">
                      <label className="block text-sm font-medium text-charcoal-700 mb-3">
                        Theme
                      </label>
                      <div className="flex gap-3">
                        {[
                          { id: 'light', label: 'Light' },
                          { id: 'dark', label: 'Dark', disabled: true },
                          { id: 'system', label: 'System', disabled: true }
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => !theme.disabled && setAppearance(prev => ({ ...prev, theme: theme.id }))}
                            disabled={theme.disabled}
                            className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                              appearance.theme === theme.id
                                ? 'border-primary-500 bg-primary-50'
                                : theme.disabled
                                  ? 'border-charcoal-200 bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
                                  : 'border-charcoal-200 hover:border-charcoal-300'
                            }`}
                          >
                            <span className="text-sm font-medium">{theme.label}</span>
                            {theme.disabled && (
                              <span className="block text-xs text-charcoal-400 mt-1">Coming soon</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Compact Mode */}
                    <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-xl">
                      <div id="compact-mode-label">
                        <p className="font-medium text-charcoal-900">Compact Mode</p>
                        <p className="text-sm text-charcoal-500">Reduce spacing and padding</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={appearance.compactMode}
                        aria-labelledby="compact-mode-label"
                        onClick={() => setAppearance(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                        className={`toggle-switch ${appearance.compactMode ? 'bg-primary-500' : 'bg-charcoal-300'}`}
                      >
                        <span className={`toggle-switch-thumb ${appearance.compactMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Show Tips */}
                    <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-xl">
                      <div id="show-tips-label">
                        <p className="font-medium text-charcoal-900">Show Tips</p>
                        <p className="text-sm text-charcoal-500">Display helpful tips throughout the app</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={appearance.showTips}
                        aria-labelledby="show-tips-label"
                        onClick={() => setAppearance(prev => ({ ...prev, showTips: !prev.showTips }))}
                        className={`toggle-switch ${appearance.showTips ? 'bg-primary-500' : 'bg-charcoal-300'}`}
                      >
                        <span className={`toggle-switch-thumb ${appearance.showTips ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 mt-4 border-t border-charcoal-100">
                    <button
                      onClick={handleSaveAppearance}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Appearance
                    </button>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === SECTIONS.SECURITY && (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Change Password</h2>
                    <p className="text-charcoal-500 mb-6">
                      Update your password to keep your account secure.
                    </p>

                    <div className="space-y-4 max-w-md">
                      <div className="form-group">
                        <label htmlFor="current-password" className="block text-sm font-medium text-charcoal-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" aria-hidden="true" />
                          <input
                            id="current-password"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="input pl-10"
                            placeholder="Enter current password"
                            autoComplete="current-password"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="new-password" className="block text-sm font-medium text-charcoal-700 mb-1">
                          New Password
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="input"
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          aria-describedby="new-password-hint"
                        />
                        <p id="new-password-hint" className="text-xs text-charcoal-400 mt-1">Minimum 8 characters</p>
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-charcoal-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="input"
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-charcoal-100">
                    <button
                      type="submit"
                      disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences Modal */}
      <NotificationPreferences
        isOpen={notificationPrefsOpen}
        onClose={() => setNotificationPrefsOpen(false)}
      />
    </div>
  );
}
