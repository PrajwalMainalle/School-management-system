import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle = ({ className = '' }) => {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-full p-1 bg-slate-100 border border-slate-200 shadow-inner ${className}`}>
      <Globe className="w-4 h-4 ml-2 text-sky-600 mr-1" />
      <button
        type="button"
        onClick={() => toggleLanguage('en')}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
          lang === 'en'
            ? 'bg-sky-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-sky-700'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage('kn')}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 font-kannada ${
          lang === 'kn'
            ? 'bg-ecoGreen-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-ecoGreen-700'
        }`}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
};

export default LanguageToggle;
