import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  Settings,
  Building,
  MapPin,
  Globe,
  Languages,
  ShieldCheck,
  Plus,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Sprout,
  Droplets,
} from 'lucide-react';
import axios from 'axios';

export const SystemSettingsPage = () => {
  const { t, lang, setLang } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // profile | branches | localization
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [toast, setToast] = useState(null);

  // School Profile State
  const [school, setSchool] = useState({
    name: user?.schoolName || '',
    code: '',
    email: user?.email || '',
    phone: user?.phone || '',
    slogan: 'Sustainable, Modern Education Management',
    boardAffiliation: 'State Board & CBSE',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });

  // Branches State
  const [branches, setBranches] = useState([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({
    branchName: '',
    branchCode: '',
    phone: '',
    isMainBranch: false,
  });

  // Academic Years
  const [academicYears, setAcademicYears] = useState([]);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('erp_token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const [schRes, brRes, yrRes] = await Promise.all([
        axios.get('/api/school/info', reqHeaders).catch(() => null),
        axios.get('/api/school/branches', reqHeaders).catch(() => null),
        axios.get('/api/academics/years', reqHeaders).catch(() => null),
      ]);

      if (schRes?.data?.success && schRes.data.data?.school) {
        setSchool((prev) => ({
          ...prev,
          ...schRes.data.data.school,
          address: { ...prev.address, ...(schRes.data.data.school.address || {}) },
        }));
      }

      if (brRes?.data?.success && brRes.data.data?.branches) {
        setBranches(brRes.data.data.branches);
      }

      if (yrRes?.data?.success && yrRes.data.data?.academicYears) {
        setAcademicYears(yrRes.data.data.academicYears);
      }
    } catch (err) {
      console.warn('Settings fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('erp_token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.put('/api/school/info', school, reqHeaders);
      if (res?.data?.success) {
        triggerToast('School Profile & Settings updated successfully!');
      } else {
        triggerToast(res?.data?.message || 'Failed to update school profile', 'error');
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('erp_token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.post('/api/school/branches', branchForm, reqHeaders);
      if (res?.data?.success) {
        triggerToast('New School Branch added successfully!');
        setShowBranchModal(false);
        setBranchForm({ branchName: '', branchCode: '', phone: '', isMainBranch: false });
        fetchData();
      } else {
        triggerToast(res?.data?.message || 'Failed to add branch', 'error');
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-white text-xs font-semibold animate-bounce ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-ecoGreen-600'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-sky-600" />
            <span>School System Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Global Institution Profile, Campuses & Branches, and Localization Defaults
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchData} variant="outline" size="sm" icon={RefreshCw}>
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>School Profile & Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'branches'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Campuses & Branches ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('localization')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'localization'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>Academic Sessions & Language</span>
        </button>
      </div>

      {/* TAB 1: SCHOOL PROFILE & BRANDING */}
      {activeTab === 'profile' && (
        <Card title="School Profile & Institutional Identity" subtitle="Manage your official institution profile displayed on report cards and invoices">
          <form onSubmit={handleUpdateProfile} className="max-w-3xl space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  value={school.name}
                  onChange={(e) => setSchool({ ...school, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Code *</label>
                <input
                  type="text"
                  required
                  value={school.code}
                  onChange={(e) => setSchool({ ...school, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 font-mono font-bold uppercase focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={school.email}
                  onChange={(e) => setSchool({ ...school, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Phone Number</label>
                <input
                  type="text"
                  value={school.phone}
                  onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Board Affiliation</label>
                <input
                  type="text"
                  value={school.boardAffiliation}
                  onChange={(e) => setSchool({ ...school, boardAffiliation: e.target.value })}
                  placeholder="e.g. CBSE / ICSE / State Board"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motto / Eco Slogan</label>
                <input
                  type="text"
                  value={school.slogan}
                  onChange={(e) => setSchool({ ...school, slogan: e.target.value })}
                  placeholder="e.g. Learn • Grow • Protect"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Address Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Physical Campus Address</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={school.address?.street || ''}
                  onChange={(e) =>
                    setSchool({ ...school, address: { ...school.address, street: e.target.value } })
                  }
                  placeholder="Street Address"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={school.address?.city || ''}
                  onChange={(e) =>
                    setSchool({ ...school, address: { ...school.address, city: e.target.value } })
                  }
                  placeholder="City"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={school.address?.state || ''}
                  onChange={(e) =>
                    setSchool({ ...school, address: { ...school.address, state: e.target.value } })
                  }
                  placeholder="State"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={school.address?.pincode || ''}
                  onChange={(e) =>
                    setSchool({ ...school, address: { ...school.address, pincode: e.target.value } })
                  }
                  placeholder="Pincode"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={school.address?.country || 'India'}
                  onChange={(e) =>
                    setSchool({ ...school, address: { ...school.address, country: e.target.value } })
                  }
                  placeholder="Country"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" icon={Save} disabled={savingProfile}>
                {savingProfile ? 'Updating Profile...' : 'Save School Profile'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: CAMPUSES & BRANCHES */}
      {activeTab === 'branches' && (
        <Card
          title={`Campuses & Branch Campuses (${branches.length})`}
          subtitle="Manage multi-campus locations under your school domain"
          action={
            <Button onClick={() => setShowBranchModal(true)} icon={Plus} variant="primary" size="sm">
              Add Campus Branch
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <div
                key={b._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800">{b.branchName}</h4>
                  <Badge variant={b.isMainBranch ? 'green' : 'sky'}>
                    {b.isMainBranch ? 'Main Campus' : 'Branch Campus'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 font-mono">
                  Code: <strong className="text-sky-700">{b.branchCode}</strong> • Phone: {b.phone || 'N/A'}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Status: <strong className="text-ecoGreen-700">{b.isActive ? 'Active' : 'Inactive'}</strong></span>
                  <span className="text-[11px] font-mono">ID: {b._id}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: ACADEMIC SESSIONS & LOCALIZATION */}
      {activeTab === 'localization' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Active Academic Session" subtitle="Current school academic year and term schedule">
            <div className="space-y-4">
              {academicYears.map((ay) => (
                <div
                  key={ay._id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    ay.isCurrent ? 'bg-sky-50 border-sky-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{ay.yearName}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {new Date(ay.startDate).toLocaleDateString()} — {new Date(ay.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {ay.isCurrent && <Badge variant="green">Current Active Session</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Language & Sustainability Theme" subtitle="System-wide localization & eco settings">
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">System Interface Language</span>
                <p className="text-slate-500 text-[11px]">
                  School ERP provides bilingual language support for English and Kannada (ಕನ್ನಡ).
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      lang === 'en'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white border text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    English (Default)
                  </button>
                  <button
                    onClick={() => setLang('kn')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      lang === 'kn'
                        ? 'bg-ecoGreen-600 text-white shadow-sm'
                        : 'bg-white border text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ಕನ್ನಡ (Kannada)
                  </button>
                </div>
              </div>

              <div className="p-4 bg-ecoGreen-50/60 rounded-xl border border-ecoGreen-200 text-ecoGreen-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span>Platform Eco Commitments</span>
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Paperless workflow active across fees, homework, report cards, and notices.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ADD BRANCH MODAL */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Add Campus Branch</h3>
              <button onClick={() => setShowBranchModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchForm.branchName}
                  onChange={(e) => setBranchForm({ ...branchForm, branchName: e.target.value })}
                  placeholder="e.g. North Campus (Yelahanka)"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.branchCode}
                    onChange={(e) => setBranchForm({ ...branchForm, branchCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. GWIS-NORTH"
                    className="w-full px-3 py-2 border rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isMainBranch"
                  checked={branchForm.isMainBranch}
                  onChange={(e) => setBranchForm({ ...branchForm, isMainBranch: e.target.checked })}
                />
                <label htmlFor="isMainBranch" className="font-semibold text-slate-700">
                  Mark as Main Campus
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setShowBranchModal(false)}>
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

export default SystemSettingsPage;
