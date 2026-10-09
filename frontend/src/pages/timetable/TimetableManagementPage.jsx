import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Clock, Plus, Trash2, ShieldAlert, CheckCircle2, RefreshCw, Calendar, MapPin, User, BookOpen } from 'lucide-react';
import axios from 'axios';

export const TimetableManagementPage = () => {
  const { t } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDay, setSelectedDay] = useState('MONDAY');

  const [showAddModal, setShowAddModal] = useState(false);
  const [conflictError, setConflictError] = useState('');
  const [form, setForm] = useState({
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    startTime: '09:00',
    endTime: '09:45',
    subjectId: '',
    teacherId: '',
    roomNumber: '',
  });

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, secRes, subRes, tchRes, ttRes] = await Promise.all([
        axios.get('/api/academics/classes'),
        axios.get('/api/academics/sections'),
        axios.get('/api/academics/subjects'),
        axios.get('/api/teachers'),
        axios.get(`/api/timetable?classId=${selectedClass}&sectionId=${selectedSection}&dayOfWeek=${selectedDay}`),
      ]);

      if (clsRes.data.success) setClasses(clsRes.data.data.classes);
      if (secRes.data.success) setSections(secRes.data.data.sections);
      if (subRes.data.success) setSubjects(subRes.data.data.subjects);
      if (tchRes.data.success) setTeachers(tchRes.data.data.teachers);
      if (ttRes.data.success) setTimetable(ttRes.data.data.timetable);
    } catch (err) {
      console.warn('Timetable fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedSection, selectedDay]);

  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    setConflictError('');

    try {
      const res = await axios.post('/api/timetable', {
        ...form,
        classId: selectedClass,
        sectionId: selectedSection,
        dayOfWeek: selectedDay,
      });

      if (res.data.success) {
        setShowAddModal(false);
        fetchData();
      }
    } catch (err) {
      // Show Pre-Save Conflict Error explicitly
      setConflictError(err.response?.data?.message || 'Timetable scheduling error');
    }
  };

  const handleDeletePeriod = async (periodId) => {
    try {
      const res = await axios.delete(`/api/timetable/${periodId}`);
      if (res.data.success) fetchData();
    } catch (err) {
      alert('Error deleting period slot');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-sky-600" />
            <span>{t('timetable.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t('timetable.subtitle')}</p>
        </div>
        <Button onClick={() => { setForm({ ...form, dayOfWeek: selectedDay }); setConflictError(''); setShowAddModal(true); }} icon={Plus} variant="primary" size="sm">
          {t('timetable.addPeriod')}
        </Button>
      </div>

      {/* Class & Section Selection Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t('attendance.selectClass')}</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-800"
          >
            {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t('attendance.selectSection')}</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-800"
          >
            {sections.map((s) => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
          </select>
        </div>

        <div className="flex items-end">
          <Button onClick={fetchData} variant="ghost" size="sm" icon={RefreshCw} className="w-full">
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Day of Week Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
              selectedDay === day ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Period Schedule Grid */}
      <Card title={`Timetable Schedule: ${selectedDay}`}>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">{t('common.loading')}</div>
        ) : timetable.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No periods scheduled for {selectedDay}. Click <strong>Schedule New Period</strong> to add.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetable.map((slot) => {
              const subObj = subjects.find((s) => s._id === slot.subjectId || s.subjectCode === slot.subjectId);
              const tchObj = teachers.find((t) => t._id === slot.teacherId || t.teacherId === slot.teacherId);
              return (
                <div key={slot._id} className="p-4 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/50 to-white shadow-soft relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-[11px] font-bold">
                      Period #{slot.periodNumber}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{slot.startTime} - {slot.endTime}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mt-1">
                      <BookOpen className="w-4 h-4 text-sky-600" />
                      <span>{subObj?.subjectName || 'Mathematics'}</span>
                    </h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tchObj ? `${tchObj.firstName} ${tchObj.lastName}` : 'Anita Sharma'}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-ecoGreen-600" />
                      <span>{slot.roomNumber || 'Room 301'}</span>
                    </span>

                    <button
                      onClick={() => handleDeletePeriod(slot._id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ADD PERIOD SLOT MODAL WITH PRE-SAVE CONFLICT BANNER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">{t('timetable.addPeriod')}</h3>

            {/* PRE-SAVE CONFLICT ALERT BANNER */}
            {conflictError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-red-800">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Backend Conflict Rejected!</span>
                </p>
                <p>{conflictError}</p>
              </div>
            )}

            <form onSubmit={handleCreatePeriod} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('timetable.periodNumber')}</label>
                  <input type="number" min="1" max="10" required value={form.periodNumber} onChange={(e) => setForm({ ...form, periodNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('timetable.roomNumber')}</label>
                  <input type="text" required value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="Room 301" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('timetable.startTime')}</label>
                  <input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('timetable.endTime')}</label>
                  <input type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('timetable.subject')}</label>
                <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                  {subjects.map((sb) => <option key={sb._id} value={sb._id}>{sb.subjectName} ({sb.subjectCode})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('timetable.teacher')}</label>
                <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                  {teachers.map((tc) => <option key={tc._id} value={tc._id}>{tc.firstName} {tc.lastName} ({tc.specialization})</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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

export default TimetableManagementPage;
