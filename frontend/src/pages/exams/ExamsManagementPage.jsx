import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  FileCheck,
  Plus,
  Award,
  Sliders,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  Star,
  Check,
  RotateCw,
  Droplets,
  Trees,
} from 'lucide-react';

export default function ExamsManagementPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'marks' | 'results' | 'scales'

  // Data States
  const [examsList, setExamsList] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const [gradingScales, setGradingScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [toast, setToast] = useState(null);

  // Selected Exam for Marks Entry & Results
  const [selectedExamId, setSelectedExamId] = useState('');
  const [marksBatchData, setMarksBatchData] = useState([]);

  // Modal States
  const [showExamModal, setShowExamModal] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);

  // Form States
  const [examFormData, setExamFormData] = useState({
    name: '',
    examType: 'MID_TERM',
    classId: '',
    sectionId: '',
    gradingScaleId: '',
    subjectId1: '',
    maxMarks1: 100,
    passingMarks1: 35,
    subjectId2: '',
    maxMarks2: 100,
    passingMarks2: 35,
  });

  const [scaleFormData, setScaleFormData] = useState({
    name: 'Custom School Grading Scale',
    passingPercentage: 35,
    boundaries: [
      { grade: 'A+', minPercentage: 90, maxPercentage: 100, gradePoint: 10, remarks: 'Outstanding' },
      { grade: 'A', minPercentage: 80, maxPercentage: 89.9, gradePoint: 9, remarks: 'Excellent' },
      { grade: 'B', minPercentage: 60, maxPercentage: 79.9, gradePoint: 7, remarks: 'Good' },
      { grade: 'F', minPercentage: 0, maxPercentage: 34.9, gradePoint: 0, remarks: 'Fail' },
    ],
  });

  const token = localStorage.getItem('erp_token');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Exams
      const exRes = await fetch('/api/exams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const exJson = await exRes.json();
      if (exJson.success) setExamsList(exJson.data);

      // 2. Fetch Grading Scales
      const gsRes = await fetch('/api/exams/grading-scales', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const gsJson = await gsRes.json();
      if (gsJson.success) setGradingScales(gsJson.data);

      // 3. Fetch Report Cards for Selected Exam
      const rcRes = await fetch(`/api/exams/report-cards?examId=${selectedExamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rcJson = await rcRes.json();
      if (rcJson.success) setReportCards(rcJson.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedExamId]);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Create Exam Handler
  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: examFormData.name,
        examType: examFormData.examType,
        classId: examFormData.classId,
        sectionId: examFormData.sectionId,
        gradingScaleId: examFormData.gradingScaleId,
        schoolId: 'SCHOOL_GREENWOOD_MAIN',
        branchId: 'BRANCH_MAIN_CAMPUS',
        academicYearId: 'ay_2026_27',
        subjects: [
          {
            subjectId: examFormData.subjectId1,
            maxMarks: Number(examFormData.maxMarks1),
            passingMarks: Number(examFormData.passingMarks1),
          },
          {
            subjectId: examFormData.subjectId2,
            maxMarks: Number(examFormData.maxMarks2),
            passingMarks: Number(examFormData.passingMarks2),
          },
        ],
      };

      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Exam scheduled successfully with configurable subject max marks!');
        setShowExamModal(false);
        setExamFormData({
          name: '',
          examType: 'MID_TERM',
          classId: 'cls_10',
          sectionId: 'sec_10a',
          gradingScaleId: 'gs_cbse_10',
          subjectId1: 'sub_math10',
          maxMarks1: 100,
          passingMarks1: 35,
          subjectId2: 'sub_kan10',
          maxMarks2: 100,
          passingMarks2: 35,
        });
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Create Grading Scale Handler
  const handleCreateScale = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/exams/grading-scales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scaleFormData),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Configurable grading scale rules created successfully!');
        setShowScaleModal(false);
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Save Batch Marks
  const handleSaveMarks = async () => {
    try {
      const res = await fetch('/api/exams/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examId: selectedExamId,
          subjectId: 'sub_math10',
          marksList: marksBatchData,
        }),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Batch marks saved to backend server database!');
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Trigger Backend Result Processing Engine
  const handleRunBackendResultEngine = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/exams/calculate-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examId: selectedExamId }),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Server-side result calculation complete! Class ranks & report cards updated.');
        setReportCards(json.data.reportCards || []);
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    } finally {
      setCalculating(false);
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
            <FileCheck className="w-4 h-4" />
            <span>Examinations & Marksheets</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t('exams.title', 'Examinations & Grading')}</h1>
          <p className="text-sky-100 text-sm mt-1 max-w-2xl">{t('exams.subtitle', 'Manage exam schedules, subject mark allocations, grading rules, and report card calculation')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowExamModal(true)}
            className="flex items-center space-x-2 bg-white text-sky-700 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{t('exams.createExam', 'Schedule New Exam')}</span>
          </button>

          <button
            onClick={() => setShowScaleModal(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
          >
            <Sliders className="w-4 h-4" />
            <span>{t('exams.createScale', 'Configure Grading Scale')}</span>
          </button>
        </div>
      </div>

      {/* Automated Grade Shield Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-sky-900 text-sm">
          <div className="p-2 bg-sky-600 text-white rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold">Automated Grade & Rank Calculation:</span> Totals, percentages, grades, GPAs, and class ranks are computed automatically.
          </div>
        </div>
        <span className="text-xs bg-sky-200 text-sky-800 font-bold px-3 py-1 rounded-full">Automated Engine</span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 space-x-4">
        <button
          onClick={() => setActiveTab('exams')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'exams'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{t('exams.tabExams', 'Exam Schedules')}</span>
          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {examsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('marks')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'marks'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{t('exams.tabMarksEntry', 'Marks Entry')}</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'results'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t('exams.tabResultProcessing', 'Result Engine & Ranks')}</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {reportCards.length} Cards
          </span>
        </button>

        <button
          onClick={() => setActiveTab('scales')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'scales'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t('exams.tabGradingScale', 'Grading Scales')}</span>
        </button>
      </div>

      {/* TAB 1: EXAMS LIST & SCHEDULES */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {examsList.map((ex) => (
            <div
              key={ex._id}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block bg-sky-100 text-sky-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    {ex.examType} • Class 10-A
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{ex.name}</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md">
                  {ex.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Configured Subjects & Max Marks</span>
                <div className="grid grid-cols-2 gap-2">
                  {ex.subjects?.map((sub, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between">
                      <span className="font-bold text-gray-800">{sub.subjectId}</span>
                      <span className="text-gray-500">Max: <strong>{sub.maxMarks}</strong> | Pass: {sub.passingMarks}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Applied Scale: <strong>{ex.gradingScaleId}</strong></span>
                <button
                  onClick={() => {
                    setSelectedExamId(ex._id);
                    setActiveTab('results');
                  }}
                  className="text-sky-600 font-bold hover:underline"
                >
                  View Report Cards & Ranks →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: BATCH MARKS ENTRY (TEACHER INTERFACE) */}
      {activeTab === 'marks' && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden space-y-4">
          <div className="p-5 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Batch Marks Entry Grid</h3>
              <p className="text-xs text-gray-500">Subject: Mathematics (sub_math10) • Exam ID: {selectedExamId}</p>
            </div>
            <button
              onClick={handleSaveMarks}
              className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-transform hover:scale-105"
            >
              <Check className="w-4 h-4" />
              <span>Save Batch Marks</span>
            </button>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3">Student ID</th>
                  <th className="px-6 py-3">Subject ID</th>
                  <th className="px-6 py-3">Marks Obtained</th>
                  <th className="px-6 py-3">Max Marks</th>
                  <th className="px-6 py-3">Absent Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {marksBatchData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-gray-900">{row.studentId}</td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-600">{row.subjectId}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={row.marksObtained}
                        onChange={(e) => {
                          const updated = [...marksBatchData];
                          updated[idx].marksObtained = Number(e.target.value);
                          setMarksBatchData(updated);
                        }}
                        className="w-24 px-3 py-1.5 border rounded-lg font-bold text-sky-700 focus:ring-2 focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{row.maxMarks}</td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={row.isAbsent}
                        onChange={(e) => {
                          const updated = [...marksBatchData];
                          updated[idx].isAbsent = e.target.checked;
                          setMarksBatchData(updated);
                        }}
                        className="w-4 h-4 text-sky-600 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BACKEND RESULT ENGINE & CLASS RANKINGS */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Engine Trigger Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Automatic Grade Processing</span>
              </span>
              <h3 className="text-xl font-bold mt-1">Calculate Class Results & Ranks</h3>
              <p className="text-gray-300 text-xs mt-1">
                Calculates percentages, assigns grades according to school rules, and ranks students automatically.
              </p>
            </div>

            <button
              onClick={handleRunBackendResultEngine}
              disabled={calculating}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
            >
              <RotateCw className={`w-5 h-5 ${calculating ? 'animate-spin' : ''}`} />
              <span>{calculating ? 'Calculating...' : t('exams.calculateResults', 'Calculate Class Results')}</span>
            </button>
          </div>

          {/* Report Cards / Leaderboard Table */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-base">Class Leaderboard & Report Cards</h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                Sorted by Class Rank
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Class Rank</th>
                    <th className="px-6 py-3">Student ID</th>
                    <th className="px-6 py-3">Marks Obtained / Total</th>
                    <th className="px-6 py-3">Percentage</th>
                    <th className="px-6 py-3">Grade</th>
                    <th className="px-6 py-3">GPA</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportCards.map((rc) => (
                    <tr key={rc._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-xs ${
                          rc.classRank === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : rc.classRank === 2
                            ? 'bg-slate-200 text-slate-800'
                            : rc.classRank === 3
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          #{rc.classRank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{rc.studentId}</td>
                      <td className="px-6 py-4 font-mono text-gray-700">
                        {rc.totalObtained} / {rc.totalMax}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-sky-700">{rc.percentage}%</td>
                      <td className="px-6 py-4">
                        <span className="bg-sky-100 text-sky-800 font-extrabold px-2.5 py-1 rounded-md text-xs">
                          {rc.overallGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{rc.gpa}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          rc.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURABLE GRADING SCALE */}
      {activeTab === 'scales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gradingScales.map((scale) => (
            <div key={scale._id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{scale.name}</h3>
                  <span className="text-xs text-gray-500">Pass Percentage: <strong>{scale.passingPercentage}%</strong></span>
                </div>
                {scale.isDefault && (
                  <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded">Default Scale</span>
                )}
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="px-4 py-2">Grade</th>
                      <th className="px-4 py-2">Percentage Range</th>
                      <th className="px-4 py-2">Grade Point</th>
                      <th className="px-4 py-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {scale.boundaries?.map((b, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-bold text-sky-700">{b.grade}</td>
                        <td className="px-4 py-2">{b.minPercentage}% - {b.maxPercentage}%</td>
                        <td className="px-4 py-2 font-semibold">{b.gradePoint}</td>
                        <td className="px-4 py-2 text-gray-500 italic">{b.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: SCHEDULE EXAM */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-sky-600" />
              <span>{t('exams.createExam', 'Schedule New Exam')}</span>
            </h3>

            <form onSubmit={handleCreateExam} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('exams.examName', 'Exam Name')}</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Summative Board Assessment 2026"
                  value={examFormData.name}
                  onChange={(e) => setExamFormData({ ...examFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Exam Type</label>
                  <select
                    value={examFormData.examType}
                    onChange={(e) => setExamFormData({ ...examFormData, examType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="FORMATIVE">Formative Assessment</option>
                    <option value="SUMMATIVE">Summative Assessment</option>
                    <option value="MID_TERM">Mid-Term Exam</option>
                    <option value="FINAL">Final Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Grading Scale</label>
                  <select
                    value={examFormData.gradingScaleId}
                    onChange={(e) => setExamFormData({ ...examFormData, gradingScaleId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    {gradingScales.map((gs) => (
                      <option key={gs._id} value={gs._id}>{gs.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <span className="text-xs font-bold text-gray-700 uppercase">Subject 1 Setup</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    value={examFormData.subjectId1}
                    onChange={(e) => setExamFormData({ ...examFormData, subjectId1: e.target.value })}
                    className="px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={examFormData.maxMarks1}
                    onChange={(e) => setExamFormData({ ...examFormData, maxMarks1: e.target.value })}
                    className="px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Pass"
                    value={examFormData.passingMarks1}
                    onChange={(e) => setExamFormData({ ...examFormData, passingMarks1: e.target.value })}
                    className="px-2 py-1 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURABLE GRADING SCALE */}
      {showScaleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <span>{t('exams.createScale', 'Configure Grading Scale')}</span>
            </h3>

            <form onSubmit={handleCreateScale} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Grading Scale Name</label>
                <input
                  type="text"
                  value={scaleFormData.name}
                  onChange={(e) => setScaleFormData({ ...scaleFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Passing Percentage (%)</label>
                <input
                  type="number"
                  value={scaleFormData.passingPercentage}
                  onChange={(e) => setScaleFormData({ ...scaleFormData, passingPercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScaleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Save Scale Rules
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
          <span>Automated Examination System Active 🌿</span>
        </div>
      </div>
    </div>
  );
}
