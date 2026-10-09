import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Users, UserPlus, Search, ShieldCheck, RefreshCw, Award, BookOpen, CheckCircle } from 'lucide-react';
import axios from 'axios';

export const TeacherManagementPage = () => {
  const { t } = useLanguage();

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    qualification: 'M.Sc Mathematics, B.Ed',
    specialization: 'Mathematics',
  });

  const [assignForm, setAssignForm] = useState({ classId: '', sectionId: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tchRes, clsRes, secRes] = await Promise.all([
        axios.get(`/api/teachers?search=${search}`),
        axios.get('/api/academics/classes'),
        axios.get('/api/academics/sections'),
      ]);

      if (tchRes.data.success) setTeachers(tchRes.data.data.teachers);
      if (clsRes.data.success) setClasses(clsRes.data.data.classes);
      if (secRes.data.success) setSections(secRes.data.data.sections);
    } catch (err) {
      console.warn('Teacher fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/teachers', form);
      if (res.data.success) {
        setShowAddModal(false);
        setForm({ firstName: '', lastName: '', email: '', phone: '', qualification: '', specialization: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating teacher');
    }
  };

  const handleAssignClassTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    try {
      const res = await axios.post('/api/teachers/assign-class-teacher', {
        teacherId: selectedTeacher._id,
        classId: assignForm.classId,
        sectionId: assignForm.sectionId,
      });
      if (res.data.success) {
        setShowAssignModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning class teacher');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            <span>{t('teachers.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t('teachers.subtitle')}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={UserPlus} variant="primary" size="sm">
          {t('teachers.addTeacher')}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teacher name, ID, specialization..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <Button onClick={fetchData} variant="ghost" size="sm" icon={RefreshCw}>
          {t('common.refresh')}
        </Button>
      </div>

      {/* Faculty Table */}
      <Card title={`Faculty Members Roster (${teachers.length})`}>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">{t('common.loading')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">{t('teachers.name')}</th>
                  <th className="py-3 px-4">{t('teachers.teacherId')}</th>
                  <th className="py-3 px-4">{t('teachers.qualification')}</th>
                  <th className="py-3 px-4">{t('teachers.specialization')}</th>
                  <th className="py-3 px-4">{t('teachers.assignedClasses')}</th>
                  <th className="py-3 px-4">{t('teachers.status')}</th>
                  <th className="py-3 px-4 text-right">{t('common.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((tc) => {
                  const isClassTeacher = tc.assignedClasses?.some((c) => c.isClassTeacher);
                  return (
                    <tr key={tc._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-ecoGreen-100 text-ecoGreen-700 font-bold flex items-center justify-center text-xs">
                            {tc.firstName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{tc.firstName} {tc.lastName}</p>
                            <p className="text-[10px] text-slate-400">{tc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-sky-700">{tc.teacherId}</td>
                      <td className="py-3 px-4 text-slate-700">{tc.qualification}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{tc.specialization}</td>
                      <td className="py-3 px-4">
                        {isClassTeacher ? (
                          <Badge variant="green" icon={Award}>Class Teacher</Badge>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Subject Teacher</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={tc.status === 'ACTIVE' ? 'green' : 'warning'}>{tc.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => { setSelectedTeacher(tc); setShowAssignModal(true); }}
                          variant="outline"
                          size="sm"
                        >
                          {t('teachers.assignClassTeacher')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL 1: ADD TEACHER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">{t('teachers.addTeacher')}</h3>
            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('teachers.firstName')}</label>
                  <input type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('teachers.lastName')}</label>
                  <input type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('teachers.email')}</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="teacher@greenwood.edu" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('teachers.phone')}</label>
                  <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="+91 9876543210" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('teachers.qualification')}</label>
                <input type="text" required value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="M.Sc, B.Ed" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('teachers.specialization')}</label>
                <input type="text" required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="Mathematics" />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN CLASS TEACHER */}
      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Assign Class Teacher: {selectedTeacher.firstName}</h3>
            <form onSubmit={handleAssignClassTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                <select value={assignForm.classId} onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                  {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Section</label>
                <select value={assignForm.sectionId} onChange={(e) => setAssignForm({ ...assignForm, sectionId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                  {sections.map((s) => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowAssignModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">Assign Role</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherManagementPage;
