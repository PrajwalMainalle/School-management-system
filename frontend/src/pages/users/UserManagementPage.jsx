import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Users, UserPlus, Search, Shield, CheckCircle, XCircle, RefreshCw, Key, Filter } from 'lucide-react';
import axios from 'axios';

export const UserManagementPage = () => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New User Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    role: 'TEACHER',
    permissions: ['attendance:write'],
    languagePreference: 'en',
  });
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (roleFilter) queryParams.append('role', roleFilter);

      const res = await axios.get(`/api/users?${queryParams.toString()}`);
      if (res.data && res.data.success) {
        setUsers(res.data.data.users);
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await axios.patch(`/api/users/${userId}/status`);
      if (res.data && res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.data.isActive } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });

    try {
      const res = await axios.post('/api/users', formData);
      if (res.data && res.data.success) {
        setFormMsg({ type: 'success', text: t('users.createUserSuccess') });
        setTimeout(() => {
          setShowModal(false);
          setFormData({
            name: '',
            email: '',
            username: '',
            password: '',
            phone: '',
            role: 'TEACHER',
            permissions: ['attendance:write'],
            languagePreference: 'en',
          });
          fetchUsers();
        }, 800);
      }
    } catch (err) {
      setFormMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create user account',
      });
    }
  };

  const roleBadges = {
    ORGANIZER: 'warning',
    SUPER_ADMIN: 'sky',
    ADMIN: 'green',
    TEACHER: 'sky',
    NON_TEACHING_STAFF: 'neutral',
    STUDENT: 'green',
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            <span>{t('users.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t('users.subtitle')}</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          icon={UserPlus}
          variant="primary"
          size="sm"
        >
          {t('users.addUser')}
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin / Principal</option>
            <option value="TEACHER">Teacher</option>
            <option value="NON_TEACHING_STAFF">Non-Teaching Staff</option>
            <option value="STUDENT">Student</option>
            <option value="ORGANIZER">SaaS Organizer</option>
          </select>
          <Button onClick={fetchUsers} variant="ghost" size="sm" icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Users Data Grid Table */}
      <Card title={`System Users (${users.length})`}>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">{t('common.loading')}</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No users found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">{t('users.name')}</th>
                  <th className="py-3 px-4">{t('users.username')}</th>
                  <th className="py-3 px-4">{t('users.email')}</th>
                  <th className="py-3 px-4">{t('users.role')}</th>
                  <th className="py-3 px-4">{t('users.status')}</th>
                  <th className="py-3 px-4 text-right">{t('users.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{u.username}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={roleBadges[u.role] || 'sky'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.isActive ? 'green' : 'danger'}>
                        {u.isActive ? t('users.active') : t('users.deactivated')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        onClick={() => handleToggleStatus(u._id)}
                        variant={u.isActive ? 'outline' : 'secondary'}
                        size="sm"
                      >
                        {u.isActive ? t('users.deactivate') : t('users.activate')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">{t('users.createUserTitle')}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            {formMsg.text && (
              <div className={`p-3 rounded-lg text-xs font-medium ${formMsg.type === 'success' ? 'bg-ecoGreen-50 text-ecoGreen-700' : 'bg-red-50 text-red-700'}`}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('users.name')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('users.email')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                    placeholder="ramesh@greenwood.edu"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('users.username')}</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                    placeholder="ramesh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                    placeholder="Set password"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('users.role')}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="ADMIN">Admin / Principal</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="NON_TEACHING_STAFF">Non-Teaching Staff</option>
                    <option value="STUDENT">Student</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagementPage;
