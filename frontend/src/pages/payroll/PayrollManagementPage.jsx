import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  Plus,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  UserCheck,
  Building2,
  Droplets,
  Trees,
} from 'lucide-react';

export default function PayrollManagementPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('payroll'); // 'payroll' | 'payslips' | 'structures'

  // Data States
  const [payslips, setPayslips] = useState([]);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal States
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Form States
  const [payrollForm, setPayrollForm] = useState({
    staffId: '',
    month: 10,
    year: 2026,
    totalWorkingDays: 26,
    lopDays: 0,
  });

  const [structFormData, setStructFormData] = useState({
    staffId: '',
    basicPay: 45000,
    hra: 18000,
    transportAllowance: 3500,
    medicalAllowance: 2500,
    specialAllowance: 6000,
    pfPercentage: 12,
    professionalTax: 200,
    tdsAmount: 2000,
  });

  const token = localStorage.getItem('erp_token') || localStorage.getItem('token');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Payslips
      const psRes = await fetch('/api/payroll/payslips', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const psJson = await psRes.json().catch(() => ({}));
      if (psJson?.success) {
        setPayslips(Array.isArray(psJson.data) ? psJson.data : []);
      } else {
        setPayslips([]);
      }

      // 2. Fetch Salary Structures
      const ssRes = await fetch('/api/payroll/salary-structures', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ssJson = await ssRes.json().catch(() => ({}));
      if (ssJson?.success) {
        setStructures(Array.isArray(ssJson.data) ? ssJson.data : []);
      } else {
        setStructures([]);
      }
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

  // Run Server-Side Payroll Processor
  const handleProcessPayroll = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId: user?.schoolId || '',
          staffId: payrollForm.staffId,
          month: Number(payrollForm.month),
          year: Number(payrollForm.year),
          totalWorkingDays: Number(payrollForm.totalWorkingDays),
          lopDays: Number(payrollForm.lopDays),
        }),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Monthly payroll processed on server! LOP deductions & net salary computed.');
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Disburse Salary
  const handleDisburseSalary = async (payslipId) => {
    try {
      const res = await fetch(`/api/payroll/payslips/${payslipId}/disburse`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod: 'BANK_TRANSFER' }),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Salary disbursed to bank! Audit log recorded.');
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Create Salary Structure
  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/salary-structures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(structFormData),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Staff salary structure configured!');
        setShowStructureModal(false);
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
            <DollarSign className="w-4 h-4" />
            <span>Staff Payroll & Salary Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t('payroll.title', 'Staff Payroll & Salary')}</h1>
          <p className="text-sky-100 text-sm mt-1 max-w-2xl">{t('payroll.subtitle', 'Manage salary structures, leave deductions, and monthly salary disbursement')}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowStructureModal(true)}
          className="flex items-center space-x-2 bg-white text-sky-700 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{t('payroll.createStructure', 'Configure Salary Structure')}</span>
        </button>
      </div>

      {/* Security Guard Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-sky-900 text-sm">
          <div className="p-2 bg-sky-600 text-white rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold">{t('payroll.auditNotice', 'Automatic Salary & Deduction Calculation Active')}</span>
          </div>
        </div>
        <span className="text-xs bg-sky-200 text-sky-800 font-bold px-3 py-1 rounded-full">Automated Calculation</span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 space-x-4">
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'payroll'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{t('payroll.tabPayroll', 'Monthly Payroll Run')}</span>
        </button>

        <button
          onClick={() => setActiveTab('payslips')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'payslips'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('payroll.tabPayslips', 'Payslips Repository')}</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {payslips.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('structures')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'structures'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t('payroll.tabStructures', 'Salary Structures')}</span>
          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {structures.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MONTHLY PAYROLL PROCESSOR */}
      {activeTab === 'payroll' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payroll Run Form */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-sky-600" />
              <span>Process Monthly Payroll</span>
            </h3>

            <form onSubmit={handleProcessPayroll} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('payroll.staffId', 'Staff Member')}</label>
                <select
                  value={payrollForm.staffId}
                  onChange={(e) => setPayrollForm({ ...payrollForm, staffId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="tch_101">tch_101 (Senior Math Faculty)</option>
                  <option value="tch_102">tch_102 (Kannada Faculty)</option>
                  <option value="stf_201">stf_201 (Chief Accountant)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Month</label>
                  <select
                    value={payrollForm.month}
                    onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={payrollForm.year}
                    onChange={(e) => setPayrollForm({ ...payrollForm, year: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Working Days</label>
                  <input
                    type="number"
                    value={payrollForm.totalWorkingDays}
                    onChange={(e) => setPayrollForm({ ...payrollForm, totalWorkingDays: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('payroll.lopDays', 'Loss of Pay (LOP) Days')}</label>
                  <input
                    type="number"
                    value={payrollForm.lopDays}
                    onChange={(e) => setPayrollForm({ ...payrollForm, lopDays: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-amber-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition-transform hover:scale-105 disabled:opacity-50"
              >
                {processing ? 'Processing...' : t('payroll.processPayroll', 'Process Monthly Payroll')}
              </button>
            </form>
          </div>

          {/* Computed Payslip Preview */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
            <h3 className="font-bold text-gray-800 text-base">Monthly Payslips Summary</h3>

            <div className="divide-y divide-gray-100">
              {(payslips || []).length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No monthly payslips processed yet for this period.
                </div>
              ) : (
                (payslips || []).map((ps) => (
                  <div key={ps._id} className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs text-sky-700 font-bold">{ps.payslipNumber}</span>
                        <h4 className="font-bold text-gray-900 text-base">{ps.staffId}</h4>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          ps.status === 'DISBURSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ps.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-gray-500 block">Gross Salary</span>
                        <span className="font-bold text-gray-900">₹{ps.grossSalary?.toLocaleString() || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">LOP Deduction ({ps.lopDays || 0} days)</span>
                        <span className="font-bold text-amber-700">₹{ps.lopDeduction?.toLocaleString() || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">PF + PT + TDS</span>
                        <span className="font-bold text-red-600">₹{((ps.pfDeduction || 0) + (ps.ptDeduction || 0) + (ps.tdsDeduction || 0))?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Net Payable Salary</span>
                        <span className="font-black text-emerald-700 text-sm">₹{ps.netSalary?.toLocaleString() || 0}</span>
                      </div>
                    </div>

                    {ps.status === 'DRAFT' && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleDisburseSalary(ps._id)}
                          className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-transform hover:scale-105"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t('payroll.disburseSalary', 'Disburse Salary')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYSLIPS REPOSITORY */}
      {activeTab === 'payslips' && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-base">Monthly Staff Payslips Repository</h3>
            <span className="text-xs text-gray-500">October 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3">Payslip No.</th>
                  <th className="px-6 py-3">Staff ID</th>
                  <th className="px-6 py-3">Basic Pay</th>
                  <th className="px-6 py-3">Gross Salary</th>
                  <th className="px-6 py-3">Total Deductions</th>
                  <th className="px-6 py-3">Net Salary</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(payslips || []).length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-xs text-gray-400">
                      No payslips found in repository.
                    </td>
                  </tr>
                ) : (
                  (payslips || []).map((ps) => (
                    <tr key={ps._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-sky-700">{ps.payslipNumber}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{ps.staffId}</td>
                      <td className="px-6 py-4 font-semibold text-gray-700">₹{ps.basicPay?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">₹{ps.grossSalary?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 font-bold text-red-600">₹{ps.totalDeductions?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 font-black text-emerald-700">₹{ps.netSalary?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          ps.status === 'DISBURSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ps.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SALARY STRUCTURES */}
      {activeTab === 'structures' && (
        (structures || []).length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm max-w-xl mx-auto space-y-3">
            <Building2 className="w-12 h-12 text-sky-400 mx-auto" />
            <h3 className="font-bold text-gray-800 text-lg">No Salary Structures Defined</h3>
            <p className="text-gray-500 text-xs">
              Click "Configure Salary Structure" above to define pay bands, allowances, and statutory PF/PT deductions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(structures || []).map((st) => (
              <div key={st._id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{st.staffId}</h3>
                    <span className="text-xs text-gray-500">Basic Pay: <strong>₹{st.basicPay?.toLocaleString() || 0}</strong></span>
                  </div>
                  <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded">
                    PF: {st.pfPercentage || 0}% | PT: ₹{st.professionalTax || 0}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                  <div>HRA: <strong>₹{st.hra || 0}</strong></div>
                  <div>Transport: <strong>₹{st.transportAllowance || 0}</strong></div>
                  <div>Medical: <strong>₹{st.medicalAllowance || 0}</strong></div>
                  <div>Special: <strong>₹{st.specialAllowance || 0}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* MODAL 1: CONFIGURE SALARY STRUCTURE */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-sky-600" />
              <span>{t('payroll.createStructure', 'Configure Salary Structure')}</span>
            </h3>

            <form onSubmit={handleCreateStructure} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('payroll.staffId', 'Staff Member ID')}</label>
                <input
                  type="text"
                  value={structFormData.staffId}
                  onChange={(e) => setStructFormData({ ...structFormData, staffId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('payroll.basicPay', 'Basic Monthly Pay (₹)')}</label>
                  <input
                    type="number"
                    value={structFormData.basicPay}
                    onChange={(e) => setStructFormData({ ...structFormData, basicPay: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('payroll.hra', 'HRA (₹)')}</label>
                  <input
                    type="number"
                    value={structFormData.hra}
                    onChange={(e) => setStructFormData({ ...structFormData, hra: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                >
                  Save Salary Structure
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
          <span>Staff Payroll System Active 🌿</span>
        </div>
      </div>
    </div>
  );
}
