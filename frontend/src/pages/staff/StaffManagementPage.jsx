import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Briefcase, UserPlus, Search, Filter, ShieldCheck, RefreshCw, Key } from 'lucide-react';
import axios from 'axios';

export const StaffManagementPage = () => {
  const { t } = useLanguage();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'ACCOUNTING',
    designation: 'Accountant',
    permissions: ['fees:read', 'fees:write'],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (departmentFilter) queryParams.append('department', departmentFilter);
      if (search) queryParams.append('search', search);

      const res = await axios.get(`/api/staff?${queryParams.toString()}`);
      if (res.data && res.data.success) {
        setStaffList(res.data.data.staff);
      }
    } catch (err) {
      console.warn('Staff fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [departmentFilter, search]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/staff', form);
      if (res.data.success) {
        setShowAddModal(false);
        setForm({ firstName: '', lastName: '', email: '', phone: '', department: 'ACCOUNTING', designation: 'Accountant', permissions: ['fees:read'] });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating staff member');
    }
  };

  const deptBadges = {
    ACCOUNTING: 'sky',
    LIBRARY: 'green',
    TRANSPORT: 'warning',
    RECEPTION: 'sky',
    SECURITY: 'neutral',
    SUPPORT: 'neutral',
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-sky-600" />
            <span>{t('staff.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t('staff.subtitle')}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={UserPlus} variant="primary" size="sm">
          {t('staff.addStaff')}
        </Button>
      </div>

      {/* Department Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff name, designation, ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Dept:</span>
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
          >
            <option value="">{t('staff.allDepartments')}</option>
            <option value="ACCOUNTING">{t('staff.accounting')}</option>
            <option value="LIBRARY">{t('staff.library')}</option>
            <option value="TRANSPORT">{t('staff.transport')}</option>
            <option value="RECEPTION">{t('staff.reception')}</option>
            <option value="SECURITY">{t('staff.security')}</option>
            <option value="SUPPORT">{t('staff.support')}</option>
          </select>

          <Button onClick={fetchData} variant="ghost" size="sm" icon={RefreshCw}>
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Staff Roster Table */}
      <Card title={`Non-Teaching Staff Members (${staffList.length})`}>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">{t('common.loading')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">{t('staff.name')}</th>
                  <th className="py-3 px-4">{t('staff.staffId')}</th>
                  <th className="py-3 px-4">{t('staff.department')}</th>
                  <th className="py-3 px-4">{t('staff.designation')}</th>
                  <th className="py-3 px-4">{t('staff.permissions')}</th>
                  <th className="py-3 px-4 text-right">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                          {st.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{st.firstName} {st.lastName}</p>
                          <p className="text-[10px] text-slate-400">{st.email} • {st.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-sky-700">{st.staffId}</td>
                    <td className="py-3 px-4">
                      <Badge variant={deptBadges[st.department] || 'sky'}>{st.department}</Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">{st.designation}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {st.permissions?.map((p, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600 border border-slate-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={st.status === 'ACTIVE' ? 'green' : 'warning'}>{st.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ADD STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">{t('staff.addStaff')}</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                    <option value="ACCOUNTING">Accounting</option>
                    <option value="LIBRARY">Library</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="RECEPTION">Reception</option>
                    <option value="SECURITY">Security</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input type="text" required value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="e.g. Chief Accountant" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffManagementPage;
