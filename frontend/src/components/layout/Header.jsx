import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from '../common/LanguageToggle';
import { Search, Bell, Droplet, Sprout, LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        
        {/* Global Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all duration-150"
            />
          </div>
        </div>

        {/* Center Eco Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full eco-gradient-badge text-xs font-semibold text-slate-700">
          <Sprout className="w-4 h-4 text-ecoGreen-600" />
          <span>{t('app.slogan')}</span>
          <Droplet className="w-3.5 h-3.5 text-sky-600 ml-1" />
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-4">
          
          {/* Bilingual Language Switcher */}
          <LanguageToggle />

          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ecoGreen-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Profile Info & Logout */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-ecoGreen-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[10px] font-semibold text-sky-700">{user.role}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                title={t('auth.logout') || 'Logout'}
                aria-label="Logout"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-xs font-bold text-sky-600 hover:text-sky-700 px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50">
              {t('auth.signIn')}
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;
