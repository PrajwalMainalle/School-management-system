import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import {
  GraduationCap,
  Users,
  Briefcase,
  CheckCircle2,
  Sprout,
  Droplet,
  Languages,
  ShieldCheck,
  Clock,
  BookOpen,
  Calendar,
  UserCheck,
  Award,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import axios from 'axios';

export const DashboardPage = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    attendanceRate: '0%',
  });
  const [loading, setLoading] = useState(true);

  // Student-specific state
  const isStudent = user?.role === 'STUDENT';
  const [studentProfile, setStudentProfile] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [subjectTeachers, setSubjectTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [attendanceRate, setAttendanceRate] = useState('0%');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('erp_token') || localStorage.getItem('token');
        const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        if (isStudent) {
          // Fetch student-specific records
          const [stuRes, clsRes, secRes, ttRes, tchRes, attRes] = await Promise.all([
            axios.get('/api/students', reqHeaders).catch(() => null),
            axios.get('/api/academics/classes', reqHeaders).catch(() => null),
            axios.get('/api/academics/sections', reqHeaders).catch(() => null),
            axios.get('/api/timetable', reqHeaders).catch(() => null),
            axios.get('/api/teachers', reqHeaders).catch(() => null),
            axios.get('/api/attendance/class', reqHeaders).catch(() => null),
          ]);

          if (clsRes?.data?.success) setClasses(clsRes.data.data.classes || []);
          if (secRes?.data?.success) setSections(secRes.data.data.sections || []);

          if (attRes?.data?.success && attRes.data.data?.attendanceLogs) {
            const logs = attRes.data.data.attendanceLogs;
            if (logs.length > 0) {
              const present = logs.filter((l) => l.status === 'PRESENT').length;
              setAttendanceRate(`${((present / logs.length) * 100).toFixed(1)}%`);
            }
          }

          let foundStudent = null;
          if (stuRes?.data?.success && stuRes.data.data?.students) {
            const list = stuRes.data.data.students;
            foundStudent = list.find(
              (s) =>
                (user?.email && s.email?.toLowerCase() === user.email.toLowerCase()) ||
                (user?._id && (s.userId === user._id || s._id === user._id)) ||
                (user?.username && (s.studentId === user.username || s.email?.startsWith(user.username)))
            ) || null;
            setStudentProfile(foundStudent);
          }

          if (ttRes?.data?.success && ttRes.data.data?.timetable) {
            const allPeriods = ttRes.data.data.timetable;
            // Filter by student's class if available
            const classPeriods = foundStudent?.classId
              ? allPeriods.filter((p) => p.classId === foundStudent.classId)
              : allPeriods;
            setTimetable(classPeriods);

            // Extract unique subject teachers from timetable
            const teacherMap = new Map();
            allPeriods.forEach((p) => {
              if (p.subjectName && p.teacherName && !teacherMap.has(p.subjectName)) {
                teacherMap.set(p.subjectName, {
                  subject: p.subjectName,
                  teacher: p.teacherName,
                  room: p.roomNumber || 'Classroom',
                });
              }
            });

            if (teacherMap.size > 0) {
              setSubjectTeachers(Array.from(teacherMap.values()));
            } else if (tchRes?.data?.success && tchRes.data.data?.teachers) {
              setSubjectTeachers(
                tchRes.data.data.teachers.map((tch) => ({
                  subject: tch.specialization || 'General Subject',
                  teacher: `${tch.firstName} ${tch.lastName}`,
                  room: 'Faculty Block',
                }))
              );
            }
          }
        } else {
          // Admin / Staff / Teacher summary
          const sumRes = await axios.get('/api/school/dashboard-summary', reqHeaders).catch(() => null);
          if (sumRes?.data?.success && sumRes.data.data) {
            setSummaryData(sumRes.data.data);
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // STUDENT DASHBOARD VIEW
  if (isStudent) {
    const studentClassObj = classes.find((c) => c._id === studentProfile?.classId);
    const studentSecObj = sections.find((s) => s._id === studentProfile?.sectionId);
    const className = studentClassObj?.className || 'Assigned Class';
    const sectionName = studentSecObj?.sectionName || 'Assigned Section';

    return (
      <div className="space-y-6">
        {/* Student Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-ecoGreen-600 p-6 md:p-8 text-white shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
              <GraduationCap className="w-4 h-4 text-emerald-200" />
              <span>Student Academic Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || studentProfile?.firstName || 'Student'}!
            </h1>
            <p className="mt-2 text-sky-50 text-sm leading-relaxed">
              Enrolled in <strong className="text-white">{className} - {sectionName}</strong> • Roll / ID:{' '}
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-white">{studentProfile?.studentId || user?.username || 'STU'}</span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge variant="sky" icon={ShieldCheck}>
                {user?.schoolName || 'School Management System'}
              </Badge>
              <Badge variant="green" icon={CheckCircle2}>
                Status: Active Student
              </Badge>
              <Badge variant="sky" icon={Droplet}>
                🌱 Save Water Eco Champion
              </Badge>
            </div>
          </div>
          <div className="absolute right-4 bottom-0 opacity-15 pointer-events-none">
            <GraduationCap className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Student Profile Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card title="👤 My Profile Information">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Full Name</span>
                <span className="font-bold text-slate-800">{studentProfile ? `${studentProfile.firstName} ${studentProfile.lastName}` : (user?.name || 'Student')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student ID</span>
                <span className="font-mono font-bold text-sky-700">{studentProfile?.studentId || user?.username || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Admission No</span>
                <span className="font-mono text-slate-700">{studentProfile?.admissionNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Class & Section</span>
                <span className="font-semibold text-slate-800">{className} - {sectionName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Address</span>
                <span className="text-slate-700">{studentProfile?.email || user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Guardian Name</span>
                <span className="font-medium text-slate-700">{studentProfile?.emergencyContact?.guardianName || 'Registered Parent/Guardian'}</span>
              </div>
            </div>
          </Card>

          <Card title="📅 Daily Academic Status">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-emerald-700 font-semibold">Attendance Rate</p>
                  <p className="text-2xl font-black text-emerald-800">{attendanceRate}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-sky-700 font-semibold">Today's Class Periods</p>
                  <p className="text-xl font-bold text-sky-800">{timetable.length} Scheduled</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card title="🌱 Sustainability Hub">
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Droplet className="w-4 h-4 text-sky-600" />
                  <span>Save Water Pledge</span>
                </p>
                <p className="text-slate-600 text-[11px]">
                  Turn off dripping taps in laboratories and drinking stations. Every drop saved protects our planet!
                </p>
              </div>
              <div className="p-3 rounded-lg bg-ecoGreen-50 border border-ecoGreen-200 text-ecoGreen-900">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Sprout className="w-4 h-4 text-ecoGreen-600" />
                  <span>Campus Green Club</span>
                </p>
                <p className="text-slate-600 text-[11px]">
                  Join fellow students every Friday afternoon for school garden planting and eco awareness.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Assigned Subject Teachers Section */}
        <Card title="👨‍🏫 My Assigned Subject Teachers" subtitle={`Faculty assigned to ${className}`}>
          {subjectTeachers.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">Subject faculty assignments are being finalized by administration.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjectTeachers.map((st, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm transition-all space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                      {st.teacher?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 leading-tight">{st.teacher || 'Assigned Faculty'}</h4>
                      <p className="text-[10px] text-sky-700 font-semibold">{st.subject || 'Subject'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{st.room}</span>
                    <Badge variant="sky">Teacher</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Today's Timetable Schedule */}
        <Card title="🕒 My Class Schedule & Timetable" subtitle={`Schedule for ${className} - ${sectionName}`}>
          {timetable.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No timetable slots configured yet. Check back soon!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Timing</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Teacher</th>
                    <th className="py-2.5 px-3">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timetable.slice(0, 7).map((slot, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-sky-700">Period {slot.periodNumber || idx + 1}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {slot.startTime ? `${slot.startTime} - ${slot.endTime || ''}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{slot.subjectName || 'Scheduled Subject'}</td>
                      <td className="py-2.5 px-3 text-slate-700">{slot.teacherName || 'Assigned Faculty'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{slot.roomNumber || 'Classroom'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // DEFAULT ADMIN / STAFF VIEW
  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-ecoGreen-600 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sprout className="w-4 h-4 text-emerald-200" />
            <span>{t('dashboard.activePhase')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t('dashboard.welcome')}
          </h1>
          <p className="mt-2 text-sky-50 text-sm leading-relaxed">
            {t('dashboard.subtitle')}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Badge variant="sky" icon={ShieldCheck}>
              Smart School ERP
            </Badge>
            <Badge variant="green" icon={Languages}>
              English + ಕನ್ನಡ Support
            </Badge>
            <Badge variant="sky" icon={Droplet}>
              Save Water Theme
            </Badge>
          </div>
        </div>
        <div className="absolute right-4 bottom-0 opacity-15 pointer-events-none">
          <Sprout className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('dashboard.totalStudents')}
          value={String(summaryData.totalStudents ?? 0)}
          subtitle="Enrolled Students"
          icon={GraduationCap}
          colorScheme="sky"
          trend="Active Count"
        />
        <StatCard
          title={t('dashboard.totalTeachers')}
          value={String(summaryData.totalTeachers ?? 0)}
          subtitle="Teaching Faculty"
          icon={Users}
          colorScheme="green"
          trend="Active Faculty"
        />
        <StatCard
          title={t('dashboard.totalStaff')}
          value={String(summaryData.totalStaff ?? 0)}
          subtitle="Support Staff"
          icon={Briefcase}
          colorScheme="emerald"
          trend="Active Staff"
        />
        <StatCard
          title={t('dashboard.attendanceRate')}
          value={summaryData.attendanceRate || '0%'}
          subtitle="Today's Attendance Rate"
          icon={CheckCircle2}
          colorScheme="amber"
          trend="Today's Log"
        />
      </div>

      {/* Environmental Slogan & Sustainability Hub */}
      <Card title="🌱 Sustainability Hub" subtitle="School Eco Commitments">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-sky-50 text-sky-900 border border-sky-200">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <Droplet className="w-4 h-4 text-sky-600" />
              <span>Save Water Commitment</span>
            </p>
            <p className="text-slate-600 leading-relaxed">
              {t('ecoMsg.waterTip')}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-ecoGreen-50 text-ecoGreen-900 border border-ecoGreen-200">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <Sprout className="w-4 h-4 text-ecoGreen-600" />
              <span>Plant Trees Initiative</span>
            </p>
            <p className="text-slate-600 leading-relaxed">
              {t('ecoMsg.treeTip')}
            </p>
          </div>
        </div>

        <div className="pt-3 text-center text-slate-500 text-xs border-t border-slate-100 mt-4">
          <p className="font-semibold text-slate-700">{user?.schoolName || 'School ERP'}</p>
          <p className="text-[11px] mt-0.5">Sustainable & Modern School Platform</p>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
