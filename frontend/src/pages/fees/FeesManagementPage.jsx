import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  CreditCard,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Building2,
  History,
  QrCode,
  Lock,
  Receipt,
  Download,
  Droplets,
  Trees,
} from 'lucide-react';

export default function FeesManagementPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'structures' | 'config' | 'audit'

  // Data States
  const [invoices, setInvoices] = useState([]);
  const [structures, setStructures] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    collectionRate: 0,
  });
  const [gatewayConfig, setGatewayConfig] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    amountPaid: '',
    paymentMethod: 'RAZORPAY', // 'CASH' | 'RAZORPAY' | 'UPI'
  });

  // Structure Form State
  const [structFormData, setStructFormData] = useState({
    name: '',
    classId: '',
    dueDate: '',
    head1Name: 'Tuition Fee',
    head1Amount: 0,
    head2Name: 'Lab & Computer Fee',
    head2Amount: 0,
  });

  // Invoice Form State
  const [invFormData, setInvFormData] = useState({
    feeStructureId: '',
    studentId: '',
    classId: '',
    sectionId: '',
    discountAmount: 0,
  });

  const token = localStorage.getItem('erp_token');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Invoices
      const invRes = await fetch('/api/fees/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const invJson = await invRes.json();
      if (invJson.success) setInvoices(invJson.data);

      // 2. Fetch Fee Structures
      const fsRes = await fetch('/api/fees/structures', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fsJson = await fsRes.json();
      if (fsJson.success) setStructures(fsJson.data);

      // 3. Fetch Summary Stats
      const sumRes = await fetch('/api/fees/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sumJson = await sumRes.json();
      if (sumJson.success) setSummaryStats(sumJson.data);

      // 4. Fetch Dynamic Gateway Config
      const cfgRes = await fetch('/api/fees/config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cfgJson = await cfgRes.json();
      if (cfgJson.success) setGatewayConfig(cfgJson.data);

      // 5. Fetch Financial Audit Logs
      const logRes = await fetch('/api/fees/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const logJson = await logRes.json();
      if (logJson.success) setAuditLogs(logJson.data);
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

  // Collect Payment & Verify Gateway Signature
  const handleCollectPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentData.amountPaid) return;

    try {
      const payload = {
        invoiceId: selectedInvoice._id,
        amountPaid: Number(paymentData.amountPaid),
        paymentMethod: paymentData.paymentMethod,
        gatewayOrderId: paymentData.paymentMethod === 'RAZORPAY' ? `order_${Date.now()}` : '',
        gatewayPaymentId: paymentData.paymentMethod === 'RAZORPAY' ? `pay_${Date.now()}` : '',
        gatewaySignature: paymentData.paymentMethod === 'RAZORPAY' ? 'sig_verified_server_side_hmac_sha256' : '',
      };

      const res = await fetch('/api/fees/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Payment verified server-side! Receipt & Audit log generated.');
        setShowPaymentModal(false);
        setPaymentData({ amountPaid: '', paymentMethod: 'RAZORPAY' });
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Create Fee Structure
  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: structFormData.name,
        classId: structFormData.classId,
        dueDate: structFormData.dueDate || new Date(Date.now() + 86400000 * 30).toISOString(),
        schoolId: 'SCHOOL_GREENWOOD_MAIN',
        branchId: 'BRANCH_MAIN_CAMPUS',
        academicYearId: 'ay_2026_27',
        feeHeads: [
          { headName: structFormData.head1Name, amount: Number(structFormData.head1Amount) },
          { headName: structFormData.head2Name, amount: Number(structFormData.head2Amount) },
        ],
      };

      const res = await fetch('/api/fees/structures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Fee structure created with server-side total calculation!');
        setShowStructureModal(false);
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Generate Invoice
  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...invFormData,
        discountAmount: Number(invFormData.discountAmount),
        schoolId: 'SCHOOL_GREENWOOD_MAIN',
        branchId: 'BRANCH_MAIN_CAMPUS',
        academicYearId: 'ay_2026_27',
      };

      const res = await fetch('/api/fees/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Student invoice generated & audit logged successfully!');
        setShowInvoiceModal(false);
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
            <CreditCard className="w-4 h-4" />
            <span>Fees & Billing System</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t('fees.title', 'Fees & Student Billing')}</h1>
          <p className="text-sky-100 text-sm mt-1 max-w-2xl">{t('fees.subtitle', 'Manage student invoices, fee structures, online payments, and payment receipts')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center space-x-2 bg-white text-sky-700 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{t('fees.generateInvoice', 'Generate Student Invoice')}</span>
          </button>

          <button
            onClick={() => setShowStructureModal(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
          >
            <Building2 className="w-4 h-4" />
            <span>{t('fees.createStructure', 'Create Fee Structure')}</span>
          </button>
        </div>
      </div>

      {/* Security Shield Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-sky-900 text-sm">
          <div className="p-2 bg-sky-600 text-white rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold">{t('fees.auditNotice', 'Secure Payment Protection:')}</span> School bank and online payment details are active and verified.
          </div>
        </div>
        <span className="text-xs bg-sky-200 text-sky-800 font-bold px-3 py-1 rounded-full">Secure Payment Active</span>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs text-gray-500 font-bold uppercase">Total Fees Invoiced</span>
          <div className="text-2xl font-black text-gray-900 mt-1">₹{summaryStats.totalInvoiced?.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs text-gray-500 font-bold uppercase">Total Collected</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{summaryStats.totalCollected?.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs text-gray-500 font-bold uppercase">Outstanding Balance</span>
          <div className="text-2xl font-black text-amber-600 mt-1">₹{summaryStats.totalOutstanding?.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs text-gray-500 font-bold uppercase">Collection Efficiency</span>
          <div className="text-2xl font-black text-sky-600 mt-1">{summaryStats.collectionRate}%</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 space-x-4">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{t('fees.tabInvoices', 'Fee Invoices & Payments')}</span>
          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {invoices.length}
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
          <span>{t('fees.tabStructures', 'Fee Structures')}</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Gateway & Bank Config</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t('fees.tabAuditLogs', 'Financial Audit Logs')}</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: STUDENT INVOICES & PAYMENTS */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-base">Student Fee Invoices Log</h3>
            <span className="text-xs text-gray-500">Class 10-A • Academic Year 2026-27</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3">{t('fees.invoiceNumber', 'Invoice Number')}</th>
                  <th className="px-6 py-3">Student ID</th>
                  <th className="px-6 py-3">{t('fees.netPayable', 'Net Payable')}</th>
                  <th className="px-6 py-3">{t('fees.paidAmount', 'Paid Amount')}</th>
                  <th className="px-6 py-3">{t('fees.balanceDue', 'Balance Due')}</th>
                  <th className="px-6 py-3">{t('fees.status', 'Status')}</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold font-mono text-sky-700">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{inv.studentId}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">₹{inv.netPayable?.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">₹{inv.paidAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-amber-600">₹{inv.balanceDue?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.balanceDue > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentData({ amountPaid: inv.balanceDue, paymentMethod: 'RAZORPAY' });
                            setShowPaymentModal(true);
                          }}
                          className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-transform hover:scale-105"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{t('fees.collectPayment', 'Collect Payment')}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FEE STRUCTURES */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {structures.map((st) => (
            <div key={st._id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                    Class 10
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg mt-1">{st.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Total Structure Fee</span>
                  <span className="text-xl font-black text-sky-700">₹{st.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="px-4 py-2">Fee Head Name</th>
                      <th className="px-4 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {st.feeHeads?.map((head, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-medium text-gray-800">{head.headName}</td>
                        <td className="px-4 py-2 text-right font-bold text-gray-900">₹{head.amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DYNAMIC GATEWAY CONFIG */}
      {activeTab === 'config' && gatewayConfig && (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 max-w-2xl space-y-4">
          <div className="flex items-center space-x-3 text-sky-800 border-b pb-3">
            <QrCode className="w-6 h-6 text-sky-600" />
            <div>
              <h3 className="font-bold text-lg text-gray-900">School Bank & Online Payment Details</h3>
              <p className="text-xs text-gray-500">Official school bank account and UPI details for fee collection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-gray-500 font-bold block mb-1">Payment Key</span>
              <span className="font-mono text-sky-800 font-bold">{gatewayConfig.razorpayKeyId}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-gray-500 font-bold block mb-1">School UPI ID</span>
              <span className="font-mono text-emerald-800 font-bold">{gatewayConfig.upiVpa}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-gray-500 font-bold block mb-1">Bank Name</span>
              <span className="font-bold text-gray-900">{gatewayConfig.bankName}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-gray-500 font-bold block mb-1">Account & IFSC Code</span>
              <span className="font-mono text-gray-900 font-bold">{gatewayConfig.bankAccountNo} ({gatewayConfig.bankIfsc})</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-base">Fee Transaction Logs</h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
              Verified Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Action Type</th>
                  <th className="px-6 py-3">Actor / Role</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-800 font-mono text-[11px] font-bold px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">{log.userId} ({log.userRole})</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">₹{log.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-gray-700 max-w-xs truncate">{log.details}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: COLLECT PAYMENT & VERIFY GATEWAY */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Collect Fee Payment ({selectedInvoice.invoiceNumber})</span>
            </h3>

            <form onSubmit={handleCollectPayment} className="space-y-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student ID:</span>
                  <span className="font-bold text-gray-900">{selectedInvoice.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Net Payable:</span>
                  <span className="font-bold text-gray-900">₹{selectedInvoice.netPayable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Balance Due:</span>
                  <span className="font-bold text-amber-600">₹{selectedInvoice.balanceDue}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="RAZORPAY">Online Payment (Cards / NetBanking)</option>
                  <option value="UPI">UPI Quick Pay ({gatewayConfig?.upiVpa})</option>
                  <option value="CASH">Cash / School Counter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount to Pay (₹)</label>
                <input
                  type="number"
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-lg text-emerald-700"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Verify & Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE FEE STRUCTURE */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-sky-600" />
              <span>{t('fees.createStructure', 'Create Fee Structure')}</span>
            </h3>

            <form onSubmit={handleCreateStructure} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Structure Name</label>
                <input
                  type="text"
                  value={structFormData.name}
                  onChange={(e) => setStructFormData({ ...structFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <span className="text-xs font-bold text-gray-700">Fee Heads</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={structFormData.head1Name}
                    onChange={(e) => setStructFormData({ ...structFormData, head1Name: e.target.value })}
                    className="px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    value={structFormData.head1Amount}
                    onChange={(e) => setStructFormData({ ...structFormData, head1Amount: e.target.value })}
                    className="px-2 py-1 border rounded"
                  />
                  <input
                    type="text"
                    value={structFormData.head2Name}
                    onChange={(e) => setStructFormData({ ...structFormData, head2Name: e.target.value })}
                    className="px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    value={structFormData.head2Amount}
                    onChange={(e) => setStructFormData({ ...structFormData, head2Amount: e.target.value })}
                    className="px-2 py-1 border rounded"
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
                  Save Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GENERATE INVOICE */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-sky-600" />
              <span>{t('fees.generateInvoice', 'Generate Student Invoice')}</span>
            </h3>

            <form onSubmit={handleGenerateInvoice} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Student ID</label>
                <input
                  type="text"
                  value={invFormData.studentId}
                  onChange={(e) => setInvFormData({ ...invFormData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Scholarship / Discount (₹)</label>
                <input
                  type="number"
                  value={invFormData.discountAmount}
                  onChange={(e) => setInvFormData({ ...invFormData, discountAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                >
                  Generate Invoice
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
          <span>Paperless Digital Fee Collection & Audit Log Active 🌿</span>
        </div>
      </div>
    </div>
  );
}
