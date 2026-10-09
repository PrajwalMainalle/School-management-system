import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  GraduationCap,
  Users,
  Briefcase,
  CheckCircle2,
  Sprout,
  Droplet,
  Server,
  Database,
  Languages,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import axios from 'axios';

export const DashboardPage = () => {
  const { t, lang } = useLanguage();
  const [apiHealth, setApiHealth] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    attendanceRate: '0%',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('erp_token');
        const [healthRes, sumRes] = await Promise.all([
          axios.get('/api/health').catch(() => null),
          axios.get('/api/school/dashboard-summary', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
        ]);

        if (healthRes?.data?.success) setApiHealth(healthRes.data.data);
        if (sumRes?.data?.success && sumRes.data.data) {
          setSummaryData(sumRes.data.data);
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

      {/* System Status & Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* API Health Card */}
        <Card
          title={t('dashboard.systemStatus')}
          subtitle="Platform Overview"
          ecoBorder={true}
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${apiHealth ? 'bg-ecoGreen-100 text-ecoGreen-700' : 'bg-amber-100 text-amber-700'}`}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{t('dashboard.backendStatus')}</h4>
                  <p className="text-xs text-slate-500">System API Service</p>
                </div>
              </div>
              <Badge variant={apiHealth ? 'green' : 'warning'}>
                {apiHealth ? 'ONLINE' : 'Connecting...'}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-sky-100 text-sky-700">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{t('dashboard.databaseStatus')}</h4>
                  <p className="text-xs text-slate-500">Secure School Cloud Database</p>
                </div>
              </div>
              <Badge variant="sky">
                {apiHealth?.databaseStatus || 'Connected'}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Language Support</h4>
                  <p className="text-xs text-slate-500">Current Language: <strong className="text-sky-700">{lang === 'en' ? 'English' : 'ಕನ್ನಡ (Kannada)'}</strong></p>
                </div>
              </div>
              <Badge variant="green">Active</Badge>
            </div>
          </div>
        </Card>

        {/* Environmental Slogan & Tips */}
        <Card title="🌱 Sustainability Hub" subtitle="School Eco Commitments">
          <div className="space-y-4 text-xs">
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

            <div className="pt-2 text-center text-slate-500">
              <p className="font-semibold text-slate-700">Greenwood School ERP</p>
              <p className="text-[11px] mt-1">Sustainable & Modern School Platform</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default DashboardPage;
