import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiUser, HiLockClosed, HiBell, HiColorSwatch } from 'react-icons/hi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import useAuthStore from '../stores/authStore';

const SettingsPage = () => {
  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: HiUser },
    { id: 'account', label: 'Account', icon: HiLockClosed },
    { id: 'notifications', label: 'Notifications', icon: HiBell },
    { id: 'appearance', label: 'Appearance', icon: HiColorSwatch },
  ];

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateProfile(profileData);

    setIsLoading(false);

    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="md:w-56 flex-shrink-0">
          <div className="card p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-400 hover:bg-dark-100 hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-100 mb-6">Profile Settings</h2>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                  <Avatar
                    src={profileData.avatar}
                    alt={profileData.displayName || user?.username}
                    size="xl"
                  />
                  <div>
                    <p className="font-medium text-gray-100">Profile Picture</p>
                    <p className="text-sm text-gray-500">Enter an image URL below</p>
                  </div>
                </div>

                {/* Avatar URL */}
                <Input
                  label="Avatar URL"
                  type="url"
                  name="avatar"
                  value={profileData.avatar}
                  onChange={handleProfileChange}
                  placeholder="https://example.com/avatar.jpg"
                />

                {/* Display Name */}
                <Input
                  label="Display Name"
                  type="text"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleProfileChange}
                  placeholder="Your display name"
                />

                {/* Bio */}
                <div>
                  <label className="label">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="input resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profileData.bio.length}/500 characters
                  </p>
                </div>

                <Button type="submit" isLoading={isLoading}>
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-100 mb-6">Account Settings</h2>

              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input bg-dark-300 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className="label">Username</label>
                  <input
                    type="text"
                    value={user?.username}
                    disabled
                    className="input bg-dark-300 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Username cannot be changed
                  </p>
                </div>

                {/* Change Password */}
                <div className="pt-6 border-t border-dark-50">
                  <h3 className="font-medium text-gray-100 mb-4">Change Password</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Password change functionality coming soon.
                  </p>
                  <Button variant="secondary" disabled>
                    Change Password
                  </Button>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-dark-50">
                  <h3 className="font-medium text-red-500 mb-4">Danger Zone</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Once you delete your account, there is no going back.
                  </p>
                  <Button variant="danger" disabled>
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-100 mb-6">Notification Settings</h2>
              <p className="text-gray-400">
                Notification preferences coming soon.
              </p>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-100 mb-6">Appearance Settings</h2>
              <p className="text-gray-400">
                Theme customization coming soon. Currently using Neon Cyberpunk theme.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
