import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Search,
  Download,
  Filter,
  Users,
  GraduationCap,
  Briefcase,
  DollarSign,
  BookOpen,
  Bus,
  Home,
  Boxes,
  Calendar,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const ReportsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const [activeModule, setActiveModule] = useState('STUDENT'); // STUDENT, FINANCE, HR, LIBRARY, TRANSPORT, HOSTEL, INVENTORY
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchReportData(activeModule);
  }, [activeModule]);

  const fetchReportData = async (mod) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('erp_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/analytics/reports?moduleType=${mod}`, {
        headers,
      });
      if (res.data?.success) {
        setReportData(res.data.data || {});
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.trim().length < 2) return;

    setIsSearching(true);
    try {
      const token = localStorage.getItem('erp_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/analytics/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        headers,
      });
      if (res.data?.success) {
        setSearchResults(res.data.data || {});
      }
    } catch (err) {
      console.error('Global search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadCSV = (moduleType) => {
    window.open(`/api/analytics/reports/export?moduleType=${moduleType}`, '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart className="w-7 h-7 text-emerald-600" />
            {isStudent ? 'My Academic Performance & Student Analytics' : 'Centralized Reports, Analytics & Global Search'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isStudent
              ? 'View your learning trajectory, subject benchmarks, attendance aggregates, and download report summaries.'
              : 'Real-time multi-tenant reports, database aggregations, and instant global entity search'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownloadCSV(activeModule)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            {isStudent ? `Download Report (${activeModule})` : `Export CSV (${activeModule})`}
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-600" />
          {isStudent ? 'Search Learning Resources & Subjects' : 'Global ERP Search Bar'}
        </h2>
        <form onSubmit={handleGlobalSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isStudent
                  ? 'Search across your subjects, library books, homework topics, and notices...'
                  : 'Search across students, teachers, staff, fees, books, vehicles, hostels, inventory, events...'
              }
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center gap-2"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Search Results Drawer */}
        {searchResults && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Search Results for "{searchQuery}"
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(searchResults).map(([entityKey, items]) => {
                if (!items || items.length === 0) return null;
                return (
                  <div key={entityKey} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                      {entityKey} ({items.length})
                    </span>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {items.map((item, i) => (
                        <li key={i} className="py-1 border-b border-gray-200/50 last:border-0 font-medium">
                          {item.name || item.title || item.itemName || item.vehicleNumber || item.hostelName || item._id}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Module Selector Grid */}
      <div className={`grid gap-3 ${isStudent ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'}`}>
        {(isStudent
          ? [
              { key: 'STUDENT', label: 'Academic Progress', icon: GraduationCap, color: 'emerald' },
              { key: 'LIBRARY', label: 'Library Reading', icon: BookOpen, color: 'amber' },
              { key: 'TRANSPORT', label: 'Transport Schedule', icon: Bus, color: 'rose' },
            ]
          : [
              { key: 'STUDENT', label: 'Students', icon: GraduationCap, color: 'emerald' },
              { key: 'FINANCE', label: 'Finance', icon: DollarSign, color: 'sky' },
              { key: 'HR', label: 'HR & Payroll', icon: Briefcase, color: 'indigo' },
              { key: 'LIBRARY', label: 'Library', icon: BookOpen, color: 'amber' },
              { key: 'TRANSPORT', label: 'Transport', icon: Bus, color: 'rose' },
              { key: 'HOSTEL', label: 'Hostel', icon: Home, color: 'teal' },
              { key: 'INVENTORY', label: 'Inventory', icon: Boxes, color: 'purple' },
            ]
        ).map((item) => {
          const Icon = item.icon;
          const isSelected = activeModule === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveModule(item.key)}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Analytics Display */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[350px]">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Generating module report metrics...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{activeModule} Executive Report Summary</h2>
                <p className="text-xs text-gray-500">
                  Aggregated real-time metrics generated directly from database models
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full text-xs">
                Verified Backend Report
              </span>
            </div>

            {reportData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(reportData).map(([key, value]) => {
                  if (typeof value === 'object') return null;
                  return (
                    <div key={key} className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <div className="text-2xl font-extrabold text-gray-900">
                        {typeof value === 'number' && key.toLowerCase().includes('amount') || key.toLowerCase().includes('salary') || key.toLowerCase().includes('collected') || key.toLowerCase().includes('pending')
                          ? `₹${value.toLocaleString()}`
                          : String(value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
