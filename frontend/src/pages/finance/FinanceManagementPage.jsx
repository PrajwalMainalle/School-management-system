import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  DollarSign,
  CreditCard,
  Building2,
  TrendingUp,
  Receipt,
  ShieldCheck,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  QrCode,
  Landmark,
  Percent,
} from 'lucide-react';
import axios from 'axios';

export const FinanceManagementPage = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('overview'); // overview | gateway | transactions | audit
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [toast, setToast] = useState(null);

  // Financial Data
  const [summary, setSummary] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalInvoicesCount: 0,
    collectionRate: 0,
  });

  const [financeConfig, setFinanceConfig] = useState({
    razorpayKeyId: '',
    upiVpa: '',
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
    currency: 'INR',
    taxRatePercentage: 0,
  });

  const [invoices, setInvoices] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTxn, setSearchTxn] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('erp_token') || localStorage.getItem('token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const [sumRes, cfgRes, invRes, auditRes] = await Promise.all([
        axios.get('/api/fees/summary', reqHeaders).catch(() => null),
        axios.get('/api/fees/config', reqHeaders).catch(() => null),
        axios.get('/api/fees/invoices', reqHeaders).catch(() => null),
        axios.get('/api/fees/audit-logs', reqHeaders).catch(() => null),
      ]);

      if (sumRes?.data?.success && sumRes.data.data) {
        setSummary(sumRes.data.data);
      }
      if (cfgRes?.data?.success && cfgRes.data.data) {
        setFinanceConfig(cfgRes.data.data);
      }
      if (invRes?.data?.success && Array.isArray(invRes.data.data)) {
        setInvoices(invRes.data.data);
      } else {
        setInvoices([]);
      }
      if (auditRes?.data?.success && Array.isArray(auditRes.data.data)) {
        setAuditLogs(auditRes.data.data);
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      console.warn('Finance data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const token = localStorage.getItem('erp_token') || localStorage.getItem('token');
      const reqHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.put('/api/fees/config', financeConfig, reqHeaders);
      if (res?.data?.success) {
        triggerToast('Payment Gateway & Bank Credentials updated successfully!');
        if (res.data.data) setFinanceConfig(res.data.data);
      } else {
        triggerToast(res?.data?.message || 'Failed to update credentials', 'error');
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const filteredInvoices = (invoices || []).filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber?.toLowerCase().includes(searchTxn.toLowerCase()) ||
      inv.studentId?.toLowerCase().includes(searchTxn.toLowerCase());
    const matchesStatus = statusFilter ? inv.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-white text-xs font-semibold animate-bounce ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-ecoGreen-600'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>School Finance & Treasury</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cash Flow Management, Payment Gateway Configurations, and Audit Ledgers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchData} variant="outline" size="sm" icon={RefreshCw}>
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Invoiced"
          value={`₹${(summary.totalInvoiced || 0).toLocaleString()}`}
          subtitle="All Academic Billables"
          icon={Receipt}
          colorScheme="sky"
          trend={`${summary.totalInvoicesCount || 0} Invoices`}
        />
        <StatCard
          title="Total Collected"
          value={`₹${(summary.totalCollected || 0).toLocaleString()}`}
          subtitle="Net Realized Revenue"
          icon={TrendingUp}
          colorScheme="green"
          trend="Real-time Inflow"
        />
        <StatCard
          title="Outstanding Dues"
          value={`₹${(summary.totalOutstanding || 0).toLocaleString()}`}
          subtitle="Receivables Pending"
          icon={CreditCard}
          colorScheme="amber"
          trend="Collection Queue"
        />
        <StatCard
          title="Collection Rate"
          value={`${summary.collectionRate || 0}%`}
          subtitle="Efficiency Metric"
          icon={Percent}
          colorScheme="emerald"
          trend="Fiscal Target: >90%"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'overview'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Financial Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('gateway')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'gateway'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Bank & Gateway Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'transactions'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Billing & Invoices Ledger ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === 'audit'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: FINANCIAL OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Treasury & Settlement Summary" ecoBorder={true} className="lg:col-span-2">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Primary Settlement Bank</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {financeConfig.bankName || 'State Bank of India'} • A/C: {financeConfig.bankAccountNo ? `••••${financeConfig.bankAccountNo.slice(-4)}` : 'N/A'}
                  </p>
                </div>
                <Badge variant="green">Connected</Badge>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Online Gateway (Razorpay & UPI)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    UPI VPA: <span className="font-mono text-sky-700 font-semibold">{financeConfig.upiVpa || 'Not Configured'}</span>
                  </p>
                </div>
                <Badge variant="sky">Active Gateway</Badge>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">Statutory Tax & Regulatory Surcharge</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Applied Tax Rate: <strong>{financeConfig.taxRatePercentage || 0}%</strong> • Currency: <strong>{financeConfig.currency || 'INR'}</strong>
                  </p>
                </div>
                <Badge variant="green">Compliant</Badge>
              </div>
            </div>
          </Card>

          <Card title="Security & Compliance" subtitle="Automated Financial Audit">
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  All fee collections, receipt generations, and gateway webhooks are immutably logged with audit timestamps.
                </p>
              </div>
              <div className="p-3 bg-ecoGreen-50 rounded-lg border border-ecoGreen-100 flex items-start gap-2.5">
                <QrCode className="w-5 h-5 text-ecoGreen-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Automated UPI QR generation enables frictionless instant reconciliation without gateway processing fees.
                </p>
              </div>
              <div className="pt-2 text-center text-slate-400 text-[11px]">
                Multi-Tenant Financial Architecture • School ERP
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: BANK & GATEWAY CONFIGURATION */}
      {activeTab === 'gateway' && (
        <Card title="Bank Account & Payment Gateway Settings" subtitle="Configure online payment gateways and school bank credentials">
          <form onSubmit={handleSaveConfig} className="max-w-3xl space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={financeConfig.razorpayKeyId}
                  onChange={(e) => setFinanceConfig({ ...financeConfig, razorpayKeyId: e.target.value })}
                  placeholder="rzp_test_..."
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">School UPI VPA</label>
                <input
                  type="text"
                  value={financeConfig.upiVpa}
                  onChange={(e) => setFinanceConfig({ ...financeConfig, upiVpa: e.target.value })}
                  placeholder="school@icici"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-sky-600" />
                <span>Primary School Bank Account</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={financeConfig.bankName}
                    onChange={(e) => setFinanceConfig({ ...financeConfig, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={financeConfig.bankAccountNo}
                    onChange={(e) => setFinanceConfig({ ...financeConfig, bankAccountNo: e.target.value })}
                    placeholder="e.g. 39840291048"
                    className="w-full px-3 py-2 border rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={financeConfig.bankIfsc}
                    onChange={(e) => setFinanceConfig({ ...financeConfig, bankIfsc: e.target.value })}
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-3 py-2 border rounded-lg text-slate-800 font-mono uppercase focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Code</label>
                <select
                  value={financeConfig.currency}
                  onChange={(e) => setFinanceConfig({ ...financeConfig, currency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax Rate Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={financeConfig.taxRatePercentage}
                  onChange={(e) => setFinanceConfig({ ...financeConfig, taxRatePercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" icon={Save} disabled={savingConfig}>
                {savingConfig ? 'Saving...' : 'Save Financial Credentials'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 3: BILLING & INVOICES LEDGER */}
      {activeTab === 'transactions' && (
        <Card title={`Fee Invoices & Billing Ledger (${filteredInvoices.length})`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <input
              type="text"
              value={searchTxn}
              onChange={(e) => setSearchTxn(e.target.value)}
              placeholder="Search by invoice number, student ID..."
              className="w-full sm:w-72 px-3 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Net Payable</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      No invoices recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-sky-700">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{inv.studentId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">₹{inv.netPayable?.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">₹{inv.paidAmount?.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-amber-700">₹{inv.balanceDue?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant={
                            inv.status === 'PAID'
                              ? 'green'
                              : inv.status === 'PARTIAL'
                              ? 'sky'
                              : inv.status === 'OVERDUE'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <Card title={`Financial Audit Trail & Event Logs (${auditLogs.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-sky-800">{log.action}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{log.performedBy || 'System'}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinanceManagementPage;
