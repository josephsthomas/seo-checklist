import { useState, useEffect, useRef } from 'react';
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
  Loader2,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Camera,
  Upload,
  X,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import toast from 'react-hot-toast';
import NotificationPreferences from '../shared/NotificationPreferences';
import { useNavigate } from 'react-router-dom';

// Settings sections
const SECTIONS = {
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  APPEARANCE: 'appearance',
  SECURITY: 'security',
  DANGER: 'danger'
};

export default function UserSettingsPage() {
  const { currentUser, userProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(SECTIONS.PROFILE);
  const [notificationPrefsOpen, setNotificationPrefsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    showTips: true
  });

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Load user profile
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || currentUser?.displayName || '',
        email: currentUser?.email || '',
        company: userProfile.company || '',
        jobTitle: userProfile.jobTitle || ''
      });
      setAvatarUrl(userProfile.avatar || currentUser?.photoURL || null);
    }

    // Load appearance settings
    try {
      const savedAppearance = localStorage.getItem('appearanceSettings');
      if (savedAppearance) {
        setAppearance(JSON.parse(savedAppearance));
      }
    } catch {
      // Silently fail - use default appearance settings
    }
  }, [userProfile, currentUser]);

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Upload to Firebase Storage
      const avatarRef = ref(storage, `users/${currentUser.uid}/avatar`);
      await uploadBytes(avatarRef, file);
      const downloadUrl = await getDownloadURL(avatarRef);

      // Update Firebase Auth profile
      await updateProfile(currentUser, { photoURL: downloadUrl });

      // Update Firestore profile
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { avatar: downloadUrl }, { merge: true });

      setAvatarUrl(downloadUrl);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;

    setUploadingAvatar(true);
    try {
      // Delete from Firebase Storage
      try {
        const avatarRef = ref(storage, `users/${currentUser.uid}/avatar`);
        await deleteObject(avatarRef);
      } catch {
        // File might not exist in storage
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, { photoURL: null });

      // Update Firestore profile
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { avatar: null }, { merge: true });

      setAvatarUrl(null);
      toast.success('Avatar removed');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

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
    } catch {
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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      navigate('/login');
    } catch {
      // Error handled in context
    } finally {
      setDeleting(false);
    }
  };

  const sections = [
    { id: SECTIONS.PROFILE, label: 'Profile', icon: User, description: 'Personal information' },
    { id: SECTIONS.NOTIFICATIONS, label: 'Notifications', icon: Bell, description: 'Alerts & reminders' },
    { id: SECTIONS.APPEARANCE, label: 'Appearance', icon: Palette, description: 'Display preferences' },
    { id: SECTIONS.SECURITY, label: 'Security', icon: Shield, description: 'Password & access' },
    { id: SECTIONS.DANGER, label: 'Danger Zone', icon: Trash2, description: 'Delete account', danger: true }
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
                      ? section.danger
                        ? 'bg-red-50 border-l-4 border-red-500'
                        : 'bg-primary-50 border-l-4 border-primary-500'
                      : 'hover:bg-charcoal-50 border-l-4 border-transparent'
                  }`}
                >
                  <section.icon className={`w-5 h-5 ${
                    activeSection === section.id
                      ? section.danger
                        ? 'text-red-600'
                        : 'text-primary-600'
                      : section.danger
                        ? 'text-red-400'
                        : 'text-charcoal-400'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-medium ${
                      activeSection === section.id
                        ? section.danger
                          ? 'text-red-700'
                          : 'text-primary-700'
                        : section.danger
                          ? 'text-red-600'
                          : 'text-charcoal-700'
                    }`}>
                      {section.label}
                    </p>
                    <p className={`text-xs ${section.danger ? 'text-red-400' : 'text-charcoal-500'}`}>
                      {section.description}
                    </p>
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
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-12 h-12 text-primary-600" />
                          )}
                        </div>
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-charcoal-900">{profileForm.name || 'User'}</p>
                        <p className="text-sm text-charcoal-500">{profileForm.email}</p>
                        <div className="flex gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-700 text-sm font-medium rounded-lg transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                            Upload
                          </button>
                          {avatarUrl && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              disabled={uploadingAvatar}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-400">Max 2MB, JPG/PNG recommended</p>
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
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="input pl-10 pr-10"
                            placeholder="Enter current password"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="new-password" className="block text-sm font-medium text-charcoal-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="input pr-10"
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            aria-describedby="new-password-hint"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p id="new-password-hint" className="text-xs text-charcoal-400 mt-1">Minimum 8 characters</p>
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-charcoal-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="input pr-10"
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                        {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword.length > 0 && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Passwords match
                          </p>
                        )}
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

              {/* Danger Zone Section */}
              {activeSection === SECTIONS.DANGER && (
                <div>
                  <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </h2>
                  <p className="text-charcoal-500 mb-6">
                    Irreversible and destructive actions. Please proceed with caution.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-base font-semibold text-red-800 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-600 mb-4">
                      Once you delete your account, there is no going back. This action will permanently delete:
                    </p>
                    <ul className="text-sm text-red-600 space-y-1 mb-6 list-disc list-inside">
                      <li>Your profile and all personal data</li>
                      <li>All your projects and checklists</li>
                      <li>Uploaded files and documents</li>
                      <li>Shared links and audit reports</li>
                      <li>All team associations</li>
                    </ul>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete My Account
                      </button>
                    ) : (
                      <div className="space-y-4 bg-white p-4 rounded-lg border border-red-200">
                        <div className="form-group">
                          <label htmlFor="delete-confirm" className="block text-sm font-medium text-red-700 mb-1">
                            Type <strong>DELETE</strong> to confirm
                          </label>
                          <input
                            id="delete-confirm"
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="input border-red-300 focus:border-red-500 focus:ring-red-500"
                            placeholder="DELETE"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="delete-password" className="block text-sm font-medium text-red-700 mb-1">
                            Enter your password
                          </label>
                          <div className="relative">
                            <input
                              id="delete-password"
                              type={showDeletePassword ? 'text' : 'password'}
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              className="input border-red-300 focus:border-red-500 focus:ring-red-500 pr-10"
                              placeholder="Your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowDeletePassword(!showDeletePassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                              aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                            >
                              {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteConfirmText('');
                              setDeletePassword('');
                            }}
                            className="btn btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleting || deleteConfirmText !== 'DELETE' || !deletePassword}
                            className="btn bg-red-600 hover:bg-red-700 text-white flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Delete Forever
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
