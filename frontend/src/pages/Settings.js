import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { theme, setTheme: setAppTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'preferences'
  
  // Profile Form
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    bio: ''
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Preferences Form
  const [currency, setCurrency] = useState('INR');
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        bio: user.profile?.bio || ''
      });
      if (user.settings) {
        setCurrency(user.settings.currency || 'INR');
      }
    }
  }, [user]);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    setAppTheme(newTheme);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        settings: { currency, theme: selectedTheme }
      });
      setMessage({ type: 'success', text: 'Profile & preferences updated successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }

    if (passwordData.newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950 text-slate-900 dark:text-white py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
            Manage your personal profile, security credentials, and application preferences
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400'
              : 'bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400'
          }`}>
            <span>{message.text}</span>
          </div>
        )}

        {/* Settings Navigation Tabs */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-2 flex space-x-2 shadow-sm">
          <button
            onClick={() => { setActiveTab('profile'); setMessage(null); }}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition border ${
              activeTab === 'profile'
                ? 'border-2 border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 bg-transparent'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-navy-700 bg-transparent'
            }`}
          >
            Personal Profile
          </button>
          <button
            onClick={() => { setActiveTab('security'); setMessage(null); }}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition border ${
              activeTab === 'security'
                ? 'border-2 border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 bg-transparent'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-navy-700 bg-transparent'
            }`}
          >
            Password & Security
          </button>
          <button
            onClick={() => { setActiveTab('preferences'); setMessage(null); }}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition border ${
              activeTab === 'preferences'
                ? 'border-2 border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 bg-transparent'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-navy-700 bg-transparent'
            }`}
          >
            App Preferences
          </button>
        </div>

        {/* Tab 1: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-navy-800 pb-4">
              Profile Details
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ''}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-500 dark:text-gray-400 cursor-not-allowed text-sm"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Username cannot be changed</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-500 dark:text-gray-400 cursor-not-allowed text-sm"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Contact support to change email</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    placeholder="Rahul"
                    className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    placeholder="Sharma"
                    className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Address / Location</label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="Mumbai, India"
                    className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Bio / Investor Note</label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Long term equity investor focused on NSE/BSE stocks..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-transparent border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 font-bold rounded-xl text-sm transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-navy-800 pb-4">
              Change Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-transparent border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 font-bold rounded-xl text-sm transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Preferences */}
        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-navy-800 pb-4">
              Display & Regional Preferences
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Display Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm font-semibold"
                >
                  <option value="INR">INR (₹ Rupees)</option>
                  <option value="USD">USD ($ Dollars)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Interface Theme</label>
                <select
                  value={selectedTheme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-sm font-semibold"
                >
                  <option value="dark">Dark Mode (Default)</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-transparent border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 font-bold rounded-xl text-sm transition disabled:opacity-50"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
