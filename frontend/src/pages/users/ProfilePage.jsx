import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { User, Key, Globe, Shield, Save, CheckCircle, LogOut, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      const res = await axios.put('/api/auth/update-profile', { name, phone });
      if (res.data && res.data.success) {
        updateUser(res.data.data.user);
        setMsg({ type: 'success', text: 'Profile details updated successfully!' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });
    try {
      const res = await axios.post('/api/auth/change-password', { currentPassword, newPassword });
      if (res.data && res.data.success) {
        setPassMsg({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Password update failed' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Page Title */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-6 h-6 text-sky-600" />
          <span>{t('nav.profile')}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Manage user account profile & credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Card */}
        <Card className="text-center p-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-ecoGreen-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{user?.name}</h3>
            <p className="text-xs text-slate-500 font-mono">@{user?.username}</p>
          </div>
          <div className="pt-2">
            <Badge variant="sky">{user?.role}</Badge>
          </div>
          <div className="text-xs text-slate-600 pt-4 border-t border-slate-100 space-y-1 text-left">
            <p><strong className="text-slate-700">Email:</strong> {user?.email}</p>
            <p><strong className="text-slate-700">School ID:</strong> {user?.schoolId}</p>
            <p><strong className="text-slate-700">Branch:</strong> {user?.branchId}</p>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('auth.logout') || 'Sign Out'}</span>
            </button>
          </div>
        </Card>

        {/* Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Update Personal Information">
            {msg.text && (
              <div className={`mb-4 p-3 rounded-lg text-xs font-medium ${msg.type === 'success' ? 'bg-ecoGreen-50 text-ecoGreen-700' : 'bg-red-50 text-red-700'}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  placeholder="+91 9876543210"
                />
              </div>

              <Button type="submit" variant="primary" icon={Save}>
                Save Profile
              </Button>
            </form>
          </Card>

          <Card title="Security & Password Change">
            {passMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-xs font-medium ${passMsg.type === 'success' ? 'bg-ecoGreen-50 text-ecoGreen-700' : 'bg-red-50 text-red-700'}`}>
                {passMsg.text}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="outline" icon={Key}>
                Change Password
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
