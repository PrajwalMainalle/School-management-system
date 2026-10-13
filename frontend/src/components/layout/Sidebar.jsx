import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  Calendar,
  Clock,
  CheckSquare,
  FileCheck,
  CreditCard,
  Building2,
  DollarSign,
  Library,
  Bus,
  Home,
  Package,
  Video,
  Bell,
  BarChart3,
  Settings,
  Sprout,
  Droplets,
  ShieldCheck,
  UserCheck,
  LogOut,
} from 'lucide-react';

export const Sidebar = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
  ];

  // User Management accessible to Organizers, Super Admins, and Admins
  if (user && ['ORGANIZER', 'SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    navItems.push({ path: '/users', label: t('nav.userManagement'), icon: UserCheck });
  }

  const isStudent = user?.role === 'STUDENT';

  const rawModuleItems = [
    { path: '/students', label: t('nav.students'), icon: GraduationCap, hideForStudents: true },
    { path: '/teachers', label: t('nav.teachers'), icon: Users, hideForStudents: true },
    { path: '/staff', label: t('nav.staff'), icon: Briefcase, hideForStudents: true },
    { path: '/classes', label: t('nav.classes'), icon: BookOpen, hideForStudents: true },
    { path: '/timetable', label: t('nav.timetable'), icon: Clock },
    { path: '/attendance', label: t('nav.attendance'), icon: CheckSquare },
    { path: '/homework', label: t('nav.homework'), icon: BookOpen },
    { path: '/exams', label: t('nav.exams'), icon: FileCheck },
    { path: '/fees', label: t('nav.fees'), icon: CreditCard },
    { path: '/finance', label: t('nav.finance'), icon: Building2, hideForStudents: true },
    { path: '/payroll', label: t('nav.payroll'), icon: DollarSign, hideForStudents: true },
    { path: '/library', label: t('nav.library'), icon: Library },
    { path: '/transport', label: t('nav.transport'), icon: Bus },
    { path: '/hostel', label: t('nav.hostel'), icon: Home },
    { path: '/inventory', label: t('nav.inventory'), icon: Package, hideForStudents: true },
    { path: '/meetings', label: t('nav.meetings'), icon: Video },
    { path: '/calendar', label: t('nav.calendar'), icon: Calendar },
    { path: '/notices', label: t('nav.notices'), icon: Bell },
    { path: '/reports', label: t('nav.reports'), icon: BarChart3 },
    { path: '/settings', label: t('nav.settings'), icon: Settings, hideForStudents: true },
  ];

  const moduleItems = rawModuleItems.filter((item) => !isStudent || !item.hideForStudents);

  const allNavItems = [...navItems, ...moduleItems];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-screen flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-ecoGreen-600 flex items-center justify-center text-white shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none truncate max-w-[150px]" title={user?.schoolName || 'School ERP'}>
              {user?.schoolName || 'School ERP'}
            </h1>
            <p className="text-[11px] font-medium text-ecoGreen-600 flex items-center gap-1 mt-1">
              <span>🌱 Learn</span> • <span>Grow</span> • <span>Protect 💧</span>
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 border-l-4 border-sky-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-sky-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer mt-2 border-t border-slate-100 pt-3"
            title={t('auth.logout') || 'Logout'}
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-red-500" />
              <span>{t('auth.logout') || 'Logout'}</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-4 m-3 bg-gradient-to-br from-sky-50 to-ecoGreen-50 rounded-xl border border-sky-100 text-xs">
        <div className="flex items-center gap-2 text-sky-800 font-bold mb-1">
          <Droplets className="w-4 h-4 text-sky-600" />
          <span>Save Water & Trees</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-snug">
          Multi-Tenant ERP System for Modern Sustainable Education.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
