import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { BookOpen, Layers, BookCheck, Calendar, Building, Plus, CheckCircle2, RefreshCw, UserCheck } from 'lucide-react';
import axios from 'axios';

export const AcademicStructurePage = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('classes'); // classes | subjects | years | school
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  // Form States
  const [classForm, setClassForm] = useState({ className: '', classCode: '', numericLevel: 1, description: '' });
  const [sectionForm, setSectionForm] = useState({ classId: '', sectionName: 'Section A', capacity: 40, roomNumber: '' });
  const [subjectForm, setSubjectForm] = useState({ classId: '', subjectName: '', subjectCode: '', type: 'THEORY', maxMarks: 100, passingMarks: 35 });
  const [yearForm, setYearForm] = useState({ yearName: '2026-27', startDate: '2026-06-01', endDate: '2027-04-30', isCurrent: true });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, secRes, subRes, yrRes, schRes, brRes] = await Promise.all([
        axios.get('/api/academics/classes'),
        axios.get('/api/academics/sections'),
        axios.get('/api/academics/subjects'),
        axios.get('/api/academics/years'),
        axios.get('/api/school/info'),
        axios.get('/api/school/branches'),
      ]);

      if (clsRes.data?.success) setClasses(Array.isArray(clsRes.data.data?.classes) ? clsRes.data.data.classes : []);
      if (secRes.data?.success) setSections(Array.isArray(secRes.data.data?.sections) ? secRes.data.data.sections : []);
      if (subRes.data?.success) setSubjects(Array.isArray(subRes.data.data?.subjects) ? subRes.data.data.subjects : []);
      if (yrRes.data?.success) setAcademicYears(Array.isArray(yrRes.data.data?.academicYears) ? yrRes.data.data.academicYears : []);
      if (schRes.data?.success) setSchoolInfo(schRes.data.data?.school || null);
      if (brRes.data?.success) setBranches(Array.isArray(brRes.data.data?.branches) ? brRes.data.data.branches : []);
    } catch (err) {
      console.warn('Academic data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form Submissions
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/academics/classes', classForm);
      if (res.data.success) {
        setShowClassModal(false);
        setClassForm({ className: '', classCode: '', numericLevel: 1, description: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating class');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/academics/sections', sectionForm);
      if (res.data.success) {
        setShowSectionModal(false);
        setSectionForm({ classId: '', sectionName: 'Section A', capacity: 40, roomNumber: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating section');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/academics/subjects', subjectForm);
      if (res.data.success) {
        setShowSubjectModal(false);
        setSubjectForm({ classId: '', subjectName: '', subjectCode: '', type: 'THEORY', maxMarks: 100, passingMarks: 35 });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating subject');
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/academics/years', yearForm);
      if (res.data.success) {
        setShowYearModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating year');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-600" />
            <span>{t('academics.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t('academics.subtitle')}</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" icon={RefreshCw}>
          {t('common.refresh')}
        </Button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'classes'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('academics.tabClasses')}</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'subjects'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookCheck className="w-4 h-4" />
          <span>{t('academics.tabSubjects')}</span>
        </button>

        <button
          onClick={() => setActiveTab('years')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'years'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t('academics.tabYears')}</span>
        </button>

        <button
          onClick={() => setActiveTab('school')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'school'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{t('academics.tabSchool')}</span>
        </button>
      </div>

      {/* TAB 1: CLASSES & SECTIONS */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Classes Overview ({(classes || []).length})</h3>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowClassModal(true)} icon={Plus} variant="primary" size="sm">
                {t('academics.addClass')}
              </Button>
              <Button onClick={() => { setSectionForm({ ...sectionForm, classId: (classes || [])[0]?._id || '' }); setShowSectionModal(true); }} icon={Plus} variant="secondary" size="sm">
                {t('academics.addSection')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(classes || []).map((cls) => {
              const classSecs = (sections || []).filter((s) => s.classId === cls._id);
              const classSubs = (subjects || []).filter((sb) => sb.classId === cls._id);
              return (
                <Card key={cls._id} ecoBorder={true} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-bold text-base text-slate-800">{cls.className}</h4>
                      <p className="text-[10px] font-mono text-sky-700">{cls.classCode} • Level {cls.numericLevel}</p>
                    </div>
                    <Badge variant="green">Active</Badge>
                  </div>

                  {/* Sections List */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sections ({classSecs.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {classSecs.length > 0 ? (
                        classSecs.map((sec) => (
                          <div key={sec._id} className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-xs">
                            <span className="font-bold text-sky-800">{sec.sectionName}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5">({sec.capacity} seats • {sec.roomNumber || 'No room'})</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No sections created yet</span>
                      )}
                    </div>
                  </div>

                  {/* Subjects Count */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Subjects Configured:</span>
                    <span className="font-bold text-ecoGreen-700">{classSubs.length} Subjects</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECTS */}
      {activeTab === 'subjects' && (
        <Card title={`Subjects Catalog (${subjects.length})`} action={
          <Button onClick={() => { setSubjectForm({ ...subjectForm, classId: classes[0]?._id || '' }); setShowSubjectModal(true); }} icon={Plus} variant="primary" size="sm">
            {t('academics.addSubject')}
          </Button>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">{t('academics.subjectName')}</th>
                  <th className="py-3 px-4">{t('academics.subjectCode')}</th>
                  <th className="py-3 px-4">{t('academics.className')}</th>
                  <th className="py-3 px-4">{t('academics.type')}</th>
                  <th className="py-3 px-4">{t('academics.maxMarks')}</th>
                  <th className="py-3 px-4">{t('academics.passingMarks')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((s) => {
                  const targetClass = classes.find((c) => c._id === s.classId);
                  return (
                    <tr key={s._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">{s.subjectName}</td>
                      <td className="py-3 px-4 font-mono text-sky-700">{s.subjectCode}</td>
                      <td className="py-3 px-4">{targetClass?.className || 'Class 10'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={s.type === 'BOTH' ? 'green' : 'sky'}>{s.type}</Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold">{s.maxMarks}</td>
                      <td className="py-3 px-4 text-ecoGreen-700 font-semibold">{s.passingMarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: ACADEMIC YEARS */}
      {activeTab === 'years' && (
        <Card title={`Academic Session Years (${academicYears.length})`} action={
          <Button onClick={() => setShowYearModal(true)} icon={Plus} variant="primary" size="sm">
            {t('academics.addYear')}
          </Button>
        }>
          <div className="space-y-4">
            {academicYears.map((y) => (
              <div key={y._id} className={`p-4 rounded-xl border flex items-center justify-between ${y.isCurrent ? 'bg-sky-50/80 border-sky-300' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-800">{y.yearName}</h4>
                    {y.isCurrent && <Badge variant="green">Current Active Session</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Start: <strong>{new Date(y.startDate).toLocaleDateString()}</strong> • End: <strong>{new Date(y.endDate).toLocaleDateString()}</strong>
                  </p>
                </div>
                <Badge variant={y.status === 'ACTIVE' ? 'sky' : 'neutral'}>{y.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: SCHOOL & BRANCHES */}
      {activeTab === 'school' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="School Profile Information" ecoBorder={true}>
            {schoolInfo && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-500">School Name:</span>
                  <strong className="text-slate-800">{schoolInfo.name}</strong>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-500">School Code:</span>
                  <span className="font-mono text-sky-700 font-bold">{schoolInfo.code}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-500">Board Affiliation:</span>
                  <span className="font-semibold text-slate-700">{schoolInfo.boardAffiliation}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-500">Contact Email:</span>
                  <span className="text-slate-700">{schoolInfo.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Eco Motto:</span>
                  <span className="font-semibold text-ecoGreen-700">{schoolInfo.slogan}</span>
                </div>
              </div>
            )}
          </Card>

          <Card title={`Active School Branches (${branches.length})`}>
            <div className="space-y-3">
              {branches.map((b) => (
                <div key={b._id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">{b.branchName}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">Code: {b.branchCode} • Phone: {b.phone}</p>
                  </div>
                  {b.isMainBranch && <Badge variant="sky">Main Campus</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: ADD CLASS */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">{t('academics.addClass')}</h3>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.className')}</label>
                <input type="text" required value={classForm.className} onChange={(e) => setClassForm({ ...classForm, className: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="e.g. Class 6" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.classCode')}</label>
                <input type="text" required value={classForm.classCode} onChange={(e) => setClassForm({ ...classForm, classCode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="e.g. CLS-06" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.numericLevel')}</label>
                <input type="number" min="1" max="12" required value={classForm.numericLevel} onChange={(e) => setClassForm({ ...classForm, numericLevel: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowClassModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SECTION */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">{t('academics.addSection')}</h3>
            <form onSubmit={handleCreateSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                <select value={sectionForm.classId} onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                  {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.sectionName')}</label>
                <input type="text" required value={sectionForm.sectionName} onChange={(e) => setSectionForm({ ...sectionForm, sectionName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="e.g. Section C" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.capacity')}</label>
                <input type="number" required value={sectionForm.capacity} onChange={(e) => setSectionForm({ ...sectionForm, capacity: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowSectionModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SUBJECT */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">{t('academics.addSubject')}</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                <select value={subjectForm.classId} onChange={(e) => setSubjectForm({ ...subjectForm, classId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs">
                  {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.subjectName')}</label>
                <input type="text" required value={subjectForm.subjectName} onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="e.g. Social Science" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.subjectCode')}</label>
                <input type="text" required value={subjectForm.subjectCode} onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="e.g. SOC101" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('academics.maxMarks')}</label>
                  <input type="number" value={subjectForm.maxMarks} onChange={(e) => setSubjectForm({ ...subjectForm, maxMarks: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('academics.passingMarks')}</label>
                  <input type="number" value={subjectForm.passingMarks} onChange={(e) => setSubjectForm({ ...subjectForm, passingMarks: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowSubjectModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD ACADEMIC YEAR */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">{t('academics.addYear')}</h3>
            <form onSubmit={handleCreateYear} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.yearName')}</label>
                <input type="text" required value={yearForm.yearName} onChange={(e) => setYearForm({ ...yearForm, yearName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" placeholder="e.g. 2027-28" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.startDate')}</label>
                <input type="date" required value={yearForm.startDate} onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('academics.endDate')}</label>
                <input type="date" required value={yearForm.endDate} onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-xs" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="isCurrent" checked={yearForm.isCurrent} onChange={(e) => setYearForm({ ...yearForm, isCurrent: e.target.checked })} />
                <label htmlFor="isCurrent" className="font-semibold text-slate-700">{t('academics.isCurrent')}</label>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowYearModal(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AcademicStructurePage;
