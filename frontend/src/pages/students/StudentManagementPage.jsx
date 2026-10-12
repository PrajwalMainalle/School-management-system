import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { GraduationCap, UserPlus, Search, Filter, Eye, EyeOff, ArrowUpRight, CheckCircle2, RefreshCw, FileText, History, ShieldCheck, UserCheck } from 'lucide-react';
import axios from 'axios';

export const StudentManagementPage = () => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('directory'); // directory | admissions
  const [students, setStudents] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Selected Student Profile Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Registration & Enquiry Modals
  const [showRegModal, setShowRegModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  // Forms
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    email: '',
    password: '',
    classId: '',
    sectionId: '',
    academicYearId: 'ay_2026_27',
    status: 'ACTIVE',
    guardianName: '',
    relationship: 'Father',
    parentPhone: '',
    parentEmail: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    prevSchoolName: '',
    prevLastGrade: '',
    prevTcNumber: '',
  });

  const [enquiryForm, setEnquiryForm] = useState({
    applicantName: '',
    dateOfBirth: '',
    gender: 'MALE',
    seekingClassId: '',
    allocatedSectionId: '',
    status: 'APPLICATION',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    prevSchoolName: '',
    prevLastGrade: '',
    prevTcNumber: '',
    birthCertificate: false,
    transferCertificate: false,
    aadharCard: false,
    marksCard: false,
    remarks: '',
  });

  const [promoteForm, setPromoteForm] = useState({ targetClassId: '', targetSectionId: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('erp_token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (classFilter) queryParams.append('classId', classFilter);

      const [stuRes, admRes, clsRes, secRes] = await Promise.all([
        axios.get(`/api/students?${queryParams.toString()}`, reqHeaders).catch(() => null),
        axios.get('/api/admissions', reqHeaders).catch(() => null),
        axios.get('/api/academics/classes', reqHeaders).catch(() => null),
        axios.get('/api/academics/sections', reqHeaders).catch(() => null),
      ]);

      if (stuRes?.data?.success && stuRes.data.data?.students) {
        setStudents(stuRes.data.data.students);
      }
      if (admRes?.data?.success && admRes.data.data?.admissions) {
        setAdmissions(admRes.data.data.admissions);
      }
      if (clsRes?.data?.success && clsRes.data.data?.classes) {
        setClasses(clsRes.data.data.classes);
      }
      if (secRes?.data?.success && secRes.data.data?.sections) {
        setSections(secRes.data.data.sections);
      }
    } catch (err) {
      console.warn('SIS data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, classFilter]);

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: regForm.firstName,
        lastName: regForm.lastName,
        dateOfBirth: regForm.dateOfBirth,
        gender: regForm.gender,
        phone: regForm.phone,
        email: regForm.email,
        password: regForm.password,
        classId: regForm.classId || (classes[0]?._id || 'class_10'),
        sectionId: regForm.sectionId || (sections[0]?._id || 'sec_10a'),
        academicYearId: regForm.academicYearId || 'ay_2026_27',
        status: regForm.status || 'ACTIVE',
        address: {
          street: regForm.street,
          city: regForm.city,
          state: regForm.state,
          pincode: regForm.pincode,
        },
        emergencyContact: {
          guardianName: regForm.guardianName,
          relationship: regForm.relationship,
          phone: regForm.parentPhone,
          email: regForm.parentEmail,
        },
        previousSchoolDetails: {
          schoolName: regForm.prevSchoolName,
          lastGrade: regForm.prevLastGrade,
          tcNumber: regForm.prevTcNumber,
        },
      };

      const token = localStorage.getItem('erp_token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.post('/api/students', payload, reqHeaders);
      if (res.data.success) {
        setShowRegModal(false);
        setRegForm({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'MALE',
          phone: '',
          email: '',
          password: '',
          classId: '',
          sectionId: '',
          academicYearId: 'ay_2026_27',
          status: 'ACTIVE',
          guardianName: '',
          relationship: 'Father',
          parentPhone: '',
          parentEmail: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          prevSchoolName: '',
          prevLastGrade: '',
          prevTcNumber: '',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering student');
    }
  };

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    try {
      const documentsSubmitted = [];
      if (enquiryForm.birthCertificate) documentsSubmitted.push({ documentType: 'Birth Certificate', isVerified: true });
      if (enquiryForm.transferCertificate) documentsSubmitted.push({ documentType: 'Transfer Certificate', isVerified: true });
      if (enquiryForm.aadharCard) documentsSubmitted.push({ documentType: 'Aadhar Card', isVerified: true });
      if (enquiryForm.marksCard) documentsSubmitted.push({ documentType: 'Marks Card', isVerified: true });

      const payload = {
        applicantName: enquiryForm.applicantName,
        dateOfBirth: enquiryForm.dateOfBirth,
        gender: enquiryForm.gender,
        seekingClassId: enquiryForm.seekingClassId || (classes[0]?._id || ''),
        allocatedSectionId: enquiryForm.allocatedSectionId || '',
        status: enquiryForm.status || 'APPLICATION',
        parentName: enquiryForm.parentName,
        parentPhone: enquiryForm.parentPhone,
        parentEmail: enquiryForm.parentEmail,
        address: {
          street: enquiryForm.street,
          city: enquiryForm.city,
          state: enquiryForm.state,
          pincode: enquiryForm.pincode,
        },
        previousSchoolDetails: {
          schoolName: enquiryForm.prevSchoolName,
          lastGrade: enquiryForm.prevLastGrade,
          tcNumber: enquiryForm.prevTcNumber,
        },
        documentsSubmitted,
        remarks: enquiryForm.remarks,
      };

      const token = localStorage.getItem('erp_token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.post('/api/admissions', payload, reqHeaders);
      if (res.data.success) {
        setShowEnquiryModal(false);
        setEnquiryForm({
          applicantName: '',
          dateOfBirth: '',
          gender: 'MALE',
          seekingClassId: '',
          allocatedSectionId: '',
          status: 'APPLICATION',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          prevSchoolName: '',
          prevLastGrade: '',
          prevTcNumber: '',
          birthCertificate: false,
          transferCertificate: false,
          aadharCard: false,
          marksCard: false,
          remarks: '',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting admission application');
    }
  };

  const handleApproveAdmission = async (admissionId) => {
    try {
      const token = localStorage.getItem('erp_token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.post(`/api/admissions/${admissionId}/approve`, { allocatedSectionId: 'sec_10a' }, reqHeaders);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving admission');
    }
  };

  const handlePromoteStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const token = localStorage.getItem('erp_token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.post(`/api/students/${selectedStudent._id}/promote`, {
        targetClassId: promoteForm.targetClassId,
        targetSectionId: promoteForm.targetSectionId,
        newAcademicYearId: 'ay_2026_27',
      }, reqHeaders);
      if (res.data.success) {
        setShowPromoteModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error promoting student');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-sky-600" />
            <span>{t('students.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t('students.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowEnquiryModal(true)} icon={UserPlus} variant="outline" size="sm">
            {t('students.addEnquiry')}
          </Button>
          <Button onClick={() => setShowRegModal(true)} icon={UserPlus} variant="primary" size="sm">
            {t('students.addStudent')}
          </Button>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-2 border-b sm:border-b-0 pb-2 sm:pb-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'directory' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('students.tabDirectory')} ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('admissions')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'admissions' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('students.tabAdmissions')} ({admissions.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, STU ID..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <Button onClick={fetchData} variant="ghost" size="sm" icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {/* TAB 1: STUDENT DIRECTORY TABLE */}
      {activeTab === 'directory' && (
        <Card title="Enrolled Students Roster">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">{t('common.loading')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="py-3 px-4">{t('students.name')}</th>
                    <th className="py-3 px-4">{t('students.studentId')}</th>
                    <th className="py-3 px-4">{t('students.admissionNo')}</th>
                    <th className="py-3 px-4">{t('students.classSection')}</th>
                    <th className="py-3 px-4">{t('students.emergencyContact')}</th>
                    <th className="py-3 px-4">{t('students.status')}</th>
                    <th className="py-3 px-4 text-right">{t('common.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => {
                    const clsObj = classes.find((c) => c._id === st.classId);
                    const secObj = sections.find((s) => s._id === st.sectionId);
                    return (
                      <tr key={st._id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                              {st.firstName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{st.firstName} {st.lastName}</p>
                              <p className="text-[10px] text-slate-400">{st.gender} • DOB: {new Date(st.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-sky-700">{st.studentId}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{st.admissionNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {clsObj?.className || 'Class 10'} - {secObj?.sectionName || 'Section A'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <p className="font-medium">{st.emergencyContact?.guardianName || 'Parent'}</p>
                          <p className="text-[10px] text-slate-400">{st.phone || st.emergencyContact?.phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={st.status === 'ACTIVE' ? 'green' : 'sky'}>
                            {st.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button onClick={() => setSelectedStudent(st)} variant="outline" size="sm" icon={Eye}>
                            Profile
                          </Button>
                          {['ORGANIZER', 'SUPER_ADMIN', 'ADMIN'].includes(currentUser?.role) && (
                            <Button onClick={() => { setSelectedStudent(st); setShowPromoteModal(true); }} variant="ghost" size="sm" icon={ArrowUpRight}>
                              Promote
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: ADMISSIONS PIPELINE */}
      {activeTab === 'admissions' && (
        <Card title="New Admission Enquiries & Pipeline Applications">
          <div className="space-y-4">
            {admissions.map((adm) => {
              const targetClass = classes.find((c) => c._id === adm.seekingClassId);
              return (
                <div key={adm._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800">{adm.applicantName}</h4>
                      <Badge variant="sky">{adm.applicationNumber}</Badge>
                      <Badge variant={adm.status === 'ADMITTED' ? 'green' : adm.status === 'APPROVED' ? 'sky' : 'warning'}>{adm.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      Seeking: <strong className="text-sky-700">{targetClass?.className || 'Class 10'}</strong> • DOB: <strong>{new Date(adm.dateOfBirth).toLocaleDateString()}</strong> ({adm.gender}) • Parent: <strong>{adm.parentName}</strong> ({adm.parentPhone}) {adm.parentEmail ? `• ${adm.parentEmail}` : ''}
                    </p>
                    {adm.address?.city && (
                      <p className="text-[11px] text-slate-500">
                        Address: {adm.address.street ? `${adm.address.street}, ` : ''}{adm.address.city}, {adm.address.state || ''} {adm.address.pincode || ''}
                      </p>
                    )}
                    {adm.previousSchoolDetails?.schoolName && (
                      <p className="text-[11px] text-slate-500">
                        Previous Academic: <strong>{adm.previousSchoolDetails.schoolName}</strong> (Grade: {adm.previousSchoolDetails.lastGrade || 'N/A'})
                      </p>
                    )}
                    {adm.documentsSubmitted?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {adm.documentsSubmitted.map((doc, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                            ✓ {doc.documentType}
                          </span>
                        ))}
                      </div>
                    )}
                    {adm.remarks && <p className="text-[11px] text-slate-500 italic">Note: {adm.remarks}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    {adm.status !== 'ADMITTED' && ['ORGANIZER', 'SUPER_ADMIN', 'ADMIN'].includes(currentUser?.role) && (
                      <Button onClick={() => handleApproveAdmission(adm._id)} icon={CheckCircle2} variant="secondary" size="sm">
                        {t('students.approveAdmit')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* MODAL 1: STUDENT DETAILED PROFILE */}
      {selectedStudent && !showPromoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-ecoGreen-500 text-white font-extrabold flex items-center justify-center text-lg">
                  {selectedStudent.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <p className="text-xs text-sky-700 font-mono">{selectedStudent.studentId} • {selectedStudent.admissionNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100">
                <p className="font-bold text-slate-700">Personal & Contact</p>
                <p><span className="text-slate-500">Gender:</span> {selectedStudent.gender}</p>
                <p><span className="text-slate-500">DOB:</span> {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</p>
                <p><span className="text-slate-500">Phone:</span> {selectedStudent.phone || 'N/A'}</p>
                <p><span className="text-slate-500">Email:</span> {selectedStudent.email || 'N/A'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100">
                <p className="font-bold text-slate-700">Guardian / Emergency Contact</p>
                <p><span className="text-slate-500">Name:</span> {selectedStudent.emergencyContact?.guardianName}</p>
                <p><span className="text-slate-500">Relationship:</span> {selectedStudent.emergencyContact?.relationship}</p>
                <p><span className="text-slate-500">Phone:</span> {selectedStudent.emergencyContact?.phone}</p>
              </div>
            </div>

            {/* Previous School Info */}
            {selectedStudent.previousSchoolDetails && (
              <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-100 text-xs">
                <p className="font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Previous Academic Record</span>
                </p>
                <p className="text-slate-600">
                  School: <strong>{selectedStudent.previousSchoolDetails.schoolName}</strong> • Last Grade: <strong>{selectedStudent.previousSchoolDetails.lastGrade}</strong> • TC: {selectedStudent.previousSchoolDetails.tcNumber}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setSelectedStudent(null)}>{t('common.cancel')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER STUDENT */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-800">{t('students.addStudent')}</h3>
            <form onSubmit={handleRegisterStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input type="text" required value={regForm.firstName} onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input type="text" required value={regForm.lastName} onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input type="date" required value={regForm.dateOfBirth} onChange={(e) => setRegForm({ ...regForm, dateOfBirth: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select value={regForm.gender} onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Phone</label>
                  <input type="text" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="+91..." />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Email (Login Account)</label>
                  <input type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="student@gmail.com" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Portal Password (Optional - Defaults to Student@123)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 border rounded-lg text-xs"
                    placeholder="Set login password for student portal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class *</label>
                  <select
                    value={regForm.classId}
                    onChange={(e) => {
                      const newClassId = e.target.value;
                      const classSections = sections.filter((s) => s.classId === newClassId);
                      setRegForm({
                        ...regForm,
                        classId: newClassId,
                        sectionId: classSections[0]?._id || '',
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={regForm.sectionId}
                    onChange={(e) => setRegForm({ ...regForm, sectionId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    <option value="">Select Section</option>
                    {(regForm.classId
                      ? sections.filter((s) => s.classId === regForm.classId)
                      : sections
                    ).map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.sectionName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                <span className="font-bold text-slate-700 block">Emergency Contact / Guardian</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Guardian Name</label>
                    <input type="text" value={regForm.guardianName} onChange={(e) => setRegForm({ ...regForm, guardianName: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="Guardian Name" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Relationship</label>
                    <input type="text" value={regForm.relationship} onChange={(e) => setRegForm({ ...regForm, relationship: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="Father/Mother" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Guardian Phone *</label>
                    <input type="text" required value={regForm.parentPhone} onChange={(e) => setRegForm({ ...regForm, parentPhone: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Guardian Email</label>
                    <input type="email" value={regForm.parentEmail} onChange={(e) => setRegForm({ ...regForm, parentEmail: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="parent@gmail.com" />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                <span className="font-bold text-slate-700 block">Residential Address</span>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={regForm.street} onChange={(e) => setRegForm({ ...regForm, street: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="Street Address" />
                  <input type="text" value={regForm.city} onChange={(e) => setRegForm({ ...regForm, city: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="City" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={regForm.state} onChange={(e) => setRegForm({ ...regForm, state: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="State" />
                  <input type="text" value={regForm.pincode} onChange={(e) => setRegForm({ ...regForm, pincode: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="Pincode" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                <span className="font-bold text-slate-700 block">Previous School Details</span>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" value={regForm.prevSchoolName} onChange={(e) => setRegForm({ ...regForm, prevSchoolName: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="School Name" />
                  <input type="text" value={regForm.prevLastGrade} onChange={(e) => setRegForm({ ...regForm, prevLastGrade: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="Last Grade" />
                  <input type="text" value={regForm.prevTcNumber} onChange={(e) => setRegForm({ ...regForm, prevTcNumber: e.target.value })} className="w-full px-2.5 py-1.5 border rounded text-xs" placeholder="TC Number" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowRegModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADMISSION APPLICATION & ENQUIRY */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-slate-800">{t('students.addEnquiry')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Submit new candidate admission enquiry and application record</p>
            </div>

            <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs">
              {/* SECTION 1: APPLICANT DETAILS */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider block text-[11px] text-sky-700 border-b pb-1">
                  1. Candidate / Applicant Details
                </span>
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Applicant Full Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.applicantName}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, applicantName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    placeholder="e.g. Vikram Gowda"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={enquiryForm.dateOfBirth}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={enquiryForm.gender}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, gender: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Seeking Class *</label>
                    <select
                      value={enquiryForm.seekingClassId}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, seekingClassId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.className}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preferred Section</label>
                    <select
                      value={enquiryForm.allocatedSectionId}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, allocatedSectionId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    >
                      <option value="">Auto / Any</option>
                      {(enquiryForm.seekingClassId
                        ? sections.filter((s) => s.classId === enquiryForm.seekingClassId)
                        : sections
                      ).map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.sectionName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Application Stage</label>
                    <select
                      value={enquiryForm.status}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    >
                      <option value="APPLICATION">Application</option>
                      <option value="ENQUIRY">Enquiry</option>
                      <option value="VERIFICATION">Verification</option>
                      <option value="APPROVED">Approved</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PARENT / GUARDIAN CONTACT */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                <span className="font-bold text-slate-700 block">2. Parent / Guardian Details</span>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.parentName}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, parentName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded text-xs"
                    placeholder="e.g. Anand Gowda"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Parent Phone *</label>
                    <input
                      type="tel"
                      required
                      value={enquiryForm.parentPhone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, parentPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded text-xs"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Parent Email</label>
                    <input
                      type="email"
                      value={enquiryForm.parentEmail}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, parentEmail: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded text-xs"
                      placeholder="parent@gmail.com"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: RESIDENTIAL ADDRESS */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                <span className="font-bold text-slate-700 block">3. Residential Address</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={enquiryForm.street}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, street: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded text-xs"
                    placeholder="Street Address"
                  />
                  <input
                    type="text"
                    value={enquiryForm.city}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded text-xs"
                    placeholder="City"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={enquiryForm.state}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, state: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded text-xs"
                    placeholder="State"
                  />
                  <input
                    type="text"
                    value={enquiryForm.pincode}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, pincode: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded text-xs"
                    placeholder="Pincode"
                  />
                </div>
              </div>

              {/* SECTION 4: PREVIOUS ACADEMIC RECORD */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                <span className="font-bold text-slate-700 block">4. Previous School Information</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={enquiryForm.prevSchoolName}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, prevSchoolName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded text-xs"
                    placeholder="Previous School Name"
                  />
                  <input
                    type="text"
                    value={enquiryForm.prevLastGrade}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, prevLastGrade: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded text-xs"
                    placeholder="Last Grade / Standard"
                  />
                  <input
                    type="text"
                    value={enquiryForm.prevTcNumber}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, prevTcNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded text-xs"
                    placeholder="TC / Transfer Cert #"
                  />
                </div>
              </div>

              {/* SECTION 5: DOCUMENTS SUBMITTED CHECKLIST */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                <span className="font-bold text-slate-700 block">5. Documents Submitted Checklist</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enquiryForm.birthCertificate}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, birthCertificate: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-700">Birth Certificate</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enquiryForm.transferCertificate}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, transferCertificate: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-700">Transfer Certificate (TC)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enquiryForm.aadharCard}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, aadharCard: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-700">Aadhar / National ID</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enquiryForm.marksCard}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, marksCard: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-700">Previous Marks Sheet</span>
                  </label>
                </div>
              </div>

              {/* SECTION 6: REMARKS */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Remarks / Notes</label>
                <textarea
                  rows={2}
                  value={enquiryForm.remarks}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  placeholder="Notes on admission interview, scholarships, transport needs, etc."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" onClick={() => setShowEnquiryModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CLASS PROMOTION */}
      {showPromoteModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Transfer / Promote {selectedStudent.firstName}</h3>
            <form onSubmit={handlePromoteStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                <select value={promoteForm.targetClassId} onChange={(e) => setPromoteForm({ ...promoteForm, targetClassId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                  {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowPromoteModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">Promote Student</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagementPage;
