import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import { CheckSquare, Calendar, Plus, Save, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import axios from 'axios';

export const AttendanceManagementPage = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('classAttendance'); // classAttendance | leavePortal
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentSheet, setStudentSheet] = useState({});
  const [loading, setLoading] = useState(true);

  // Leave Requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL_LEAVE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    numberOfDays: 1,
    reason: '',
  });

  const [saveMsg, setSaveMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, secRes, stuRes, lvRes, attRes] = await Promise.all([
        axios.get('/api/academics/classes'),
        axios.get('/api/academics/sections'),
        axios.get(`/api/students?classId=${selectedClass}&sectionId=${selectedSection}`),
        axios.get('/api/leave'),
        axios.get(`/api/attendance/class?classId=${selectedClass}&sectionId=${selectedSection}&date=${attendanceDate}`),
      ]);

      if (clsRes.data.success) setClasses(clsRes.data.data.classes);
      if (secRes.data.success) setSections(secRes.data.data.sections);
      if (stuRes.data.success) {
        const list = stuRes.data.data.students;
        setStudents(list);

        // Map existing attendance or default to PRESENT
        const initialSheet = {};
        const logs = attRes.data?.data?.attendanceLogs || [];
        list.forEach((st) => {
          const found = logs.find((l) => l.entityId === st._id || l.entityId === st.studentId);
          initialSheet[st._id] = found ? found.status : 'PRESENT';
        });
        setStudentSheet(initialSheet);
      }
      if (lvRes.data.success) setLeaveRequests(lvRes.data.data.leaveRequests);
    } catch (err) {
      console.warn('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedSection, attendanceDate]);

  const handleStatusToggle = (studentId, status) => {
    setStudentSheet((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const allPresent = {};
    students.forEach((st) => (allPresent[st._id] = 'PRESENT'));
    setStudentSheet(allPresent);
  };

  const handleSaveAttendance = async () => {
    setSaveMsg('');
    try {
      const records = Object.keys(studentSheet).map((stId) => ({
        entityId: stId,
        status: studentSheet[stId],
      }));

      const res = await axios.post('/api/attendance/batch', {
        userType: 'STUDENT',
        classId: selectedClass,
        sectionId: selectedSection,
        date: attendanceDate,
        attendanceRecords: records,
      });

      if (res.data.success) {
        setSaveMsg(t('attendance.attendanceSaved'));
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/leave', leaveForm);
      if (res.data.success) {
        setShowLeaveModal(false);
        setLeaveForm({ leaveType: 'CASUAL_LEAVE', startDate: '', endDate: '', numberOfDays: 1, reason: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave');
    }
  };

  const handleUpdateLeaveStatus = async (leaveId, status) => {
    try {
      const res = await axios.patch(`/api/leave/${leaveId}/status`, { status });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  // KPI Calculations
  const totalCount = students.length;
  const presentCount = Object.values(studentSheet).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(studentSheet).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(studentSheet).filter((s) => s === 'LATE').length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-sky-600" />
            <span>{t('attendance.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t('attendance.subtitle')}</p>
        </div>
        <Button onClick={() => setShowLeaveModal(true)} icon={Plus} variant="primary" size="sm">
          {t('attendance.applyLeave')}
        </Button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('classAttendance')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'classAttendance' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('attendance.tabClassAttendance')}
        </button>
        <button
          onClick={() => setActiveTab('leavePortal')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'leavePortal' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('attendance.tabLeavePortal')} ({leaveRequests.length})
        </button>
      </div>

      {/* TAB 1: CLASS ATTENDANCE LOG */}
      {activeTab === 'classAttendance' && (
        <div className="space-y-6">
          
          {/* Class, Section & Date Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('attendance.selectClass')}</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('attendance.selectSection')}</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {sections.map((s) => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('attendance.date')}</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleMarkAllPresent} variant="outline" size="sm" className="w-full py-2">
                {t('attendance.markAllPresent')}
              </Button>
            </div>
          </div>

          {/* Attendance KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={totalCount} colorScheme="sky" />
            <StatCard title="Present Today" value={presentCount} colorScheme="green" />
            <StatCard title="Absent" value={absentCount} colorScheme="amber" />
            <StatCard title="Late Arrivals" value={lateCount} colorScheme="emerald" />
          </div>

          {saveMsg && (
            <div className="p-3 rounded-lg bg-ecoGreen-50 border border-ecoGreen-200 text-xs text-ecoGreen-700 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-ecoGreen-600" />
              <span>{saveMsg}</span>
            </div>
          )}

          {/* Student Attendance Marking Roster */}
          <Card
            title="Class Attendance Sheet"
            action={
              <Button onClick={handleSaveAttendance} icon={Save} variant="primary" size="sm">
                {t('attendance.saveBatchAttendance')}
              </Button>
            }
          >
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">{t('common.loading')}</div>
            ) : (
              <div className="space-y-3">
                {students.map((st) => {
                  const currentStatus = studentSheet[st._id] || 'PRESENT';
                  return (
                    <div key={st._id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                          {st.firstName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{st.firstName} {st.lastName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">{st.studentId} • Roll #{st.admissionNumber}</p>
                        </div>
                      </div>

                      {/* Status Pills */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st._id, 'PRESENT')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-ecoGreen-600 text-white border-ecoGreen-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-ecoGreen-50'
                          }`}
                        >
                          {t('attendance.present')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st._id, 'ABSENT')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-red-600 text-white border-red-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50'
                          }`}
                        >
                          {t('attendance.absent')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st._id, 'LATE')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                          }`}
                        >
                          {t('attendance.late')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st._id, 'ON_LEAVE')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            currentStatus === 'ON_LEAVE'
                              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-sky-50'
                          }`}
                        >
                          {t('attendance.onLeave')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

        </div>
      )}

      {/* TAB 2: LEAVE MANAGEMENT PORTAL */}
      {activeTab === 'leavePortal' && (
        <Card title="Staff & Faculty Leave Applications">
          <div className="space-y-4">
            {leaveRequests.map((l) => (
              <div key={l._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-800">{l.applicantName}</h4>
                    <Badge variant="sky">{l.role}</Badge>
                    <Badge variant={l.status === 'APPROVED' ? 'green' : l.status === 'REJECTED' ? 'danger' : 'warning'}>
                      {l.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Type: <strong className="text-sky-700">{l.leaveType}</strong> • Dates: <strong>{new Date(l.startDate).toLocaleDateString()}</strong> to <strong>{new Date(l.endDate).toLocaleDateString()}</strong> ({l.numberOfDays} days)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reason: {l.reason}</p>
                </div>

                {l.status === 'APPLIED' && (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleUpdateLeaveStatus(l._id, 'APPROVED')} variant="secondary" size="sm">
                      {t('attendance.approveLeave')}
                    </Button>
                    <Button onClick={() => handleUpdateLeaveStatus(l._id, 'REJECTED')} variant="danger" size="sm">
                      {t('attendance.rejectLeave')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* APPLY LEAVE MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">{t('attendance.applyLeave')}</h3>
            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('attendance.leaveType')}</label>
                <select value={leaveForm.leaveType} onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                  <option value="CASUAL_LEAVE">Casual Leave</option>
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="EARNED_LEAVE">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('attendance.startDate')}</label>
                  <input type="date" required value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('attendance.endDate')}</label>
                  <input type="date" required value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('attendance.reason')}</label>
                <textarea required value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs h-20" placeholder="State reason for leave..." />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowLeaveModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceManagementPage;
