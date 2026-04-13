import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  User,
  Mail,
  Lock,
  Settings,
  Save,
  AlertCircle
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    language: user?.language || 'en',
    darkMode: user?.preferences?.darkMode || false,
    notifications: user?.preferences?.notifications || true,
    studyReminders: user?.preferences?.studyReminders || true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        username: formData.username,
        language: formData.language,
        preferences: {
          darkMode: formData.darkMode,
          notifications: formData.notifications,
          studyReminders: formData.studyReminders
        }
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-white/80">Manage your account settings and preferences</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <AlertCircle size={20} className="text-green-600" />
            ) : (
              <AlertCircle size={20} className="text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary-100 p-3 rounded-lg">
              <User size={24} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field"
                placeholder="Your username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'es' })}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="es">Español (Spanish)</option>
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={handleProfileSave}
              disabled={saving}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-secondary-100 p-3 rounded-lg">
              <Settings size={24} className="text-secondary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
          </div>

          <div className="space-y-4">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Dark Mode</h3>
                <p className="text-sm text-gray-600">Enable dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.darkMode}
                  onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Receive study reminders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Study Reminders */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Study Reminders</h3>
                <p className="text-sm text-gray-600">Daily study notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.studyReminders}
                  onChange={(e) => setFormData({ ...formData, studyReminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Account Actions */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={logout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card mt-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Lock size={24} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input-field"
              placeholder="Current password"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input-field"
              placeholder="New password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input-field"
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword}
          className="mt-4 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lock size={20} />
          <span>{changingPassword ? 'Changing...' : 'Change Password'}</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;