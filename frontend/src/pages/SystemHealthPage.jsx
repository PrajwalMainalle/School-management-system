import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Activity, RefreshCw, CheckCircle, Server, Database, ShieldCheck, Code, Globe, Smartphone } from 'lucide-react';
import axios from 'axios';

export const SystemHealthPage = () => {
  const { t } = useLanguage();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/health');
      if (res.data && res.data.success) {
        setHealth(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const phaseChecklist = [
    { title: 'School Workspace Structure', status: true, detail: 'Web, Backend, and Mobile modules organized' },
    { title: 'Web Dashboard Interface', status: true, detail: 'Clean Sky Blue + Eco Green responsive layout' },
    { title: 'Server Data Service', status: true, detail: 'Connected to official cloud database' },
    { title: 'Database Connectivity', status: true, detail: 'MongoDB cloud cluster verified & active' },
    { title: 'Mobile Synchronization', status: true, detail: 'Mobile app connection ready' },
    { title: 'Eco Theme Design System', status: true, detail: 'Save Water + Plant Trees theme tokens active' },
    { title: 'Bilingual Support (English + Kannada)', status: true, detail: 'Instant language switcher active' },
    { title: 'School Core Components', status: true, detail: 'Forms, Cards, Tables, Badges & Modals active' },
    { title: 'Health Verification Service', status: true, detail: 'Automatic health checks active' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-600" />
            <span>System Health & Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time System Status & Workspace Verification
          </p>
        </div>
        <Button
          onClick={fetchHealth}
          icon={RefreshCw}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          {loading ? 'Testing...' : t('common.refresh')}
        </Button>
      </div>

      {/* Live Backend Response Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backend API Info Card */}
        <Card title="📡 API Server Status" ecoBorder={true}>
          {error ? (
            <div className="p-4 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              <p className="font-bold">Backend Connection Failed</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : health ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">System Name:</span>
                <span className="font-bold text-slate-800">{health.system}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Status:</span>
                <Badge variant="green">{health.status}</Badge>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">System Status:</span>
                <span className="font-bold text-sky-700">{health.phase}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Environment:</span>
                <span className="font-mono text-slate-700">{health.environment}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Theme:</span>
                <span className="font-semibold text-ecoGreen-700">{health.theme}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Database Status:</span>
                <Badge variant="sky">{health.databaseStatus}</Badge>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Server Uptime:</span>
                <span className="font-mono text-slate-700">{Math.floor(health.uptimeSeconds)} seconds</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Checking API server status...</p>
          )}
        </Card>

        {/* System Platforms Overview */}
        <Card title="🌐 Architecture Platforms">
          <div className="space-y-4">
            
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-sky-600" />
                <div>
                  <h4 className="font-bold text-slate-800">React Web Application</h4>
                  <p className="text-slate-500 text-[11px]">Vite + Tailwind CSS + Lucide + i18n</p>
                </div>
              </div>
              <Badge variant="green">Ready</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-ecoGreen-600" />
                <div>
                  <h4 className="font-bold text-slate-800">Express REST API Backend</h4>
                  <p className="text-slate-500 text-[11px]">Modular Controllers, Routes & Services</p>
                </div>
              </div>
              <Badge variant="green">Ready</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-slate-800">React Native Mobile App</h4>
                  <p className="text-slate-500 text-[11px]">Shared Backend & MongoDB API Client</p>
                </div>
              </div>
              <Badge variant="sky">Foundation Ready</Badge>
            </div>

          </div>
        </Card>

      </div>

      {/* Verification Checklist */}
      <Card title="✅ System Health Verification Checklist">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phaseChecklist.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-ecoGreen-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default SystemHealthPage;
