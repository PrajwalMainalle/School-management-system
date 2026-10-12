import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Plus,
  UploadCloud,
  CheckCircle2,
  FileText,
  Award,
  Calendar,
  Clock,
  UserCheck,
  Search,
  Filter,
  DownloadCloud,
  Droplets,
  Trees,
  Check,
  AlertCircle,
  Paperclip,
} from 'lucide-react';

export default function HomeworkManagementPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'submissions' | 'materials'

  // Data States
  const [homeworkList, setHomeworkList] = useState([]);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal States
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Form States
  const [hwFormData, setHwFormData] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    title: '',
    instructions: '',
    dueDate: '',
    attachmentName: '',
  });

  const [matFormData, setMatFormData] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    uploadedBy: '',
    title: '',
    description: '',
    category: 'NOTES',
    attachmentName: '',
  });

  const [evalFormData, setEvalFormData] = useState({
    grade: '',
    teacherFeedback: '',
  });

  const token = localStorage.getItem('erp_token');

  // Fetch Homework & Study Materials
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Homeworks
      const hwRes = await fetch('/api/homework', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hwJson = await hwRes.json();
      if (hwJson.success) {
        setHomeworkList(hwJson.data);
        if (hwJson.data && hwJson.data.length > 0) {
          const firstHwId = hwJson.data[0]._id;
          const detRes = await fetch(`/api/homework/${firstHwId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const detJson = await detRes.json();
          if (detJson.success && detJson.data?.submissions) {
            setSubmissionsList(detJson.data.submissions);
          }
        }
      }

      // 2. Fetch Study Materials
      const matRes = await fetch('/api/homework/study-materials', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const matJson = await matRes.json();
      if (matJson.success) setStudyMaterials(matJson.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Create Homework Handler
  const handleCreateHomework = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...hwFormData,
        schoolId: user?.schoolId || '',
        branchId: user?.branchId || '',
        academicYearId: 'ay_2026_27',
        attachmentFiles: hwFormData.attachmentName
          ? [{ name: hwFormData.attachmentName }]
          : [{ name: 'Assignment_Guide.pdf' }],
      };

      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Homework assigned with relational links & cloud storage attachment!');
        setShowHomeworkModal(false);
        setHwFormData({
          classId: 'cls_10',
          sectionId: 'sec_10a',
          subjectId: 'sub_math10',
          teacherId: 'tch_101',
          title: '',
          instructions: '',
          dueDate: '',
          attachmentName: '',
        });
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Create Study Material Handler
  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...matFormData,
        schoolId: user?.schoolId || '',
        branchId: user?.branchId || '',
        academicYearId: 'ay_2026_27',
        attachmentFiles: matFormData.attachmentName
          ? [{ name: matFormData.attachmentName }]
          : [{ name: 'Study_Notes_2026.pdf' }],
      };

      const res = await fetch('/api/homework/study-materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Study material uploaded to Cloud repository successfully!');
        setShowMaterialModal(false);
        setMatFormData({
          classId: 'cls_10',
          sectionId: 'sec_10a',
          subjectId: 'sub_math10',
          uploadedBy: 'tch_101',
          title: '',
          description: '',
          category: 'NOTES',
          attachmentName: '',
        });
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Submit Grade Evaluation
  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      const res = await fetch(`/api/homework/submissions/${selectedSubmission._id}/evaluate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(evalFormData),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Student submission evaluated & graded!');
        setShowEvaluateModal(false);
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-white font-medium animate-bounce ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-200 text-sm font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Homework & Learning Resources</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t('homework.title', 'Homework & Study Materials')}</h1>
          <p className="text-sky-100 text-sm mt-1 max-w-2xl">{t('homework.subtitle', 'Create homework assignments, evaluate student submissions, and share digital study materials')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowHomeworkModal(true)}
            className="flex items-center space-x-2 bg-white text-sky-700 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{t('homework.createHomework', 'Create Homework')}</span>
          </button>

          <button
            onClick={() => setShowMaterialModal(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('homework.uploadMaterial', 'Upload Study Material')}</span>
          </button>
        </div>
      </div>

      {/* Cloud Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-sky-900 text-sm">
          <div className="p-2 bg-sky-600 text-white rounded-lg">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold">Digital File Storage:</span> Study materials and homework attachments can be uploaded and downloaded safely.
          </div>
        </div>
        <span className="text-xs bg-sky-200 text-sky-800 font-bold px-3 py-1 rounded-full">Secure Attachments</span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 space-x-4">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('homework.tabAssignments', 'Homework Assignments')}</span>
          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {homeworkList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'submissions'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{t('homework.tabSubmissions', 'Student Submissions')}</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {submissionsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'materials'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('homework.tabStudyMaterials', 'Study Materials')}</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {studyMaterials.length}
          </span>
        </button>
      </div>

      {/* TAB 1: HOMEWORK ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {homeworkList.map((hw) => (
            <div
              key={hw._id}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block bg-sky-100 text-sky-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    Class 10-A • Mathematics
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{hw.title}</h3>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md">
                  {hw.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {hw.instructions}
              </p>

              {/* Relational details & due date */}
              <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <span>Teacher ID: <strong>{hw.teacherId}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Due: <strong>{new Date(hw.dueDate).toLocaleDateString()}</strong></span>
                </div>
              </div>

              {/* Attachments via Cloud Storage */}
              {hw.attachments && hw.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 flex items-center space-x-1 mb-2">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Cloud Storage Attachment Link:</span>
                  </span>
                  {hw.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-xs bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium px-3 py-1.5 rounded-lg border border-sky-200 transition-colors"
                    >
                      <DownloadCloud className="w-3.5 h-3.5 text-sky-600" />
                      <span className="truncate max-w-xs">{att.name}</span>
                      <span className="text-[10px] bg-sky-200 px-1.5 py-0.5 rounded text-sky-900 font-mono">
                        {att.provider || 'AWS S3'}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: STUDENT SUBMISSIONS & EVALUATION */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-gray-800 text-base">Student Submissions Log</h3>
            <span className="text-xs text-gray-500">Homework ID: hw_1</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3">Student ID</th>
                  <th className="px-6 py-3">Submission Date</th>
                  <th className="px-6 py-3">Submission Notes & Text</th>
                  <th className="px-6 py-3">Cloud Attachment</th>
                  <th className="px-6 py-3">Grade & Feedback</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissionsList.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{sub.studentId}</td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {new Date(sub.submissionDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700 max-w-xs truncate">
                      {sub.submissionText}
                    </td>
                    <td className="px-6 py-4">
                      {sub.attachments && sub.attachments.length > 0 ? (
                        <a
                          href={sub.attachments[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 font-medium hover:underline"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{sub.attachments[0].name}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No file</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub.grade ? (
                        <div className="space-y-0.5">
                          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                            Grade: {sub.grade}
                          </span>
                          <p className="text-[11px] text-gray-500 italic">{sub.teacherFeedback}</p>
                        </div>
                      ) : (
                        <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                          Pending Evaluation
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setShowEvaluateModal(true);
                        }}
                        className="inline-flex items-center space-x-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-transform hover:scale-105"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{t('homework.evaluate', 'Evaluate')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STUDY MATERIAL REPOSITORY */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyMaterials.map((mat) => (
            <div
              key={mat._id}
              className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    {mat.category}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Class 10</span>
                </div>
                <h4 className="font-bold text-gray-900 text-base">{mat.title}</h4>
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {mat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                {mat.attachments && mat.attachments.length > 0 ? (
                  <a
                    href={mat.attachments[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-transform hover:scale-105"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Download Resource</span>
                  </a>
                ) : null}
                <span className="text-[10px] text-gray-400">By {mat.uploadedBy}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: CREATE HOMEWORK */}
      {showHomeworkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <span>{t('homework.createHomework', 'Create Homework')}</span>
            </h3>

            <form onSubmit={handleCreateHomework} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Class ID</label>
                  <input
                    type="text"
                    value={hwFormData.classId}
                    onChange={(e) => setHwFormData({ ...hwFormData, classId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Section ID</label>
                  <input
                    type="text"
                    value={hwFormData.sectionId}
                    onChange={(e) => setHwFormData({ ...hwFormData, sectionId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Subject ID</label>
                  <input
                    type="text"
                    value={hwFormData.subjectId}
                    onChange={(e) => setHwFormData({ ...hwFormData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teacher ID</label>
                  <input
                    type="text"
                    value={hwFormData.teacherId}
                    onChange={(e) => setHwFormData({ ...hwFormData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('homework.homeworkTitle', 'Homework Title')}</label>
                <input
                  type="text"
                  placeholder="e.g. Science Chapter 5 Diagram Exercise"
                  value={hwFormData.title}
                  onChange={(e) => setHwFormData({ ...hwFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('homework.instructions', 'Instructions')}</label>
                <textarea
                  rows="3"
                  placeholder="Detailed student instructions..."
                  value={hwFormData.instructions}
                  onChange={(e) => setHwFormData({ ...hwFormData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('homework.dueDate', 'Due Date')}</label>
                <input
                  type="date"
                  value={hwFormData.dueDate}
                  onChange={(e) => setHwFormData({ ...hwFormData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Attachment Filename (Cloud Upload Simulation)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter5_Reference_Guide.pdf"
                  value={hwFormData.attachmentName}
                  onChange={(e) => setHwFormData({ ...hwFormData, attachmentName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowHomeworkModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                >
                  Assign Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD STUDY MATERIAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
              <span>{t('homework.uploadMaterial', 'Upload Study Material')}</span>
            </h3>

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Class ID</label>
                  <input
                    type="text"
                    value={matFormData.classId}
                    onChange={(e) => setMatFormData({ ...matFormData, classId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Subject ID</label>
                  <input
                    type="text"
                    value={matFormData.subjectId}
                    onChange={(e) => setMatFormData({ ...matFormData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Material Title</label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka SSLC Model Question Paper 2026"
                  value={matFormData.title}
                  onChange={(e) => setMatFormData({ ...matFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={matFormData.category}
                  onChange={(e) => setMatFormData({ ...matFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="NOTES">Class Notes</option>
                  <option value="SYLLABUS">Syllabus Copy</option>
                  <option value="PREVIOUS_PAPER">Previous Year Question Paper</option>
                  <option value="REFERENCE">Reference Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={matFormData.description}
                  onChange={(e) => setMatFormData({ ...matFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Attachment File Name</label>
                <input
                  type="text"
                  placeholder="e.g. SSLC_Math_ModelPaper_2026.pdf"
                  value={matFormData.attachmentName}
                  onChange={(e) => setMatFormData({ ...matFormData, attachmentName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Upload to Cloud Storage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EVALUATE & GRADE SUBMISSION */}
      {showEvaluateModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-sky-600" />
              <span>Evaluate Submission ({selectedSubmission.studentId})</span>
            </h3>

            <form onSubmit={handleEvaluate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Grade / Marks</label>
                <input
                  type="text"
                  value={evalFormData.grade}
                  onChange={(e) => setEvalFormData({ ...evalFormData, grade: e.target.value })}
                  placeholder="e.g. A+, 95/100, Outstanding"
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teacher Feedback</label>
                <textarea
                  rows="3"
                  value={evalFormData.teacherFeedback}
                  onChange={(e) => setEvalFormData({ ...evalFormData, teacherFeedback: e.target.value })}
                  placeholder="Feedback notes for student..."
                  className="w-full px-3 py-2 border rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvaluateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Eco Footer Badge */}
      <div className="bg-gradient-to-r from-emerald-500 to-sky-600 rounded-2xl p-4 text-white flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-sky-200" />
          <span>Save Water • Plant Trees Campaign</span>
        </div>
        <div className="flex items-center space-x-2">
          <Trees className="w-4 h-4 text-emerald-200" />
          <span>Digital Homework & Learning System Active 🌿</span>
        </div>
      </div>
    </div>
  );
}
