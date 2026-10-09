import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Heart, Sprout } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200/80 px-6 py-4 mt-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Sprout className="w-4 h-4 text-ecoGreen-600" />
        <span>© 2026 {t('app.title')} — {t('app.slogan')}</span>
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <span className="text-sky-700 font-semibold">{t('app.saveWater')} 💧</span>
        <span className="text-ecoGreen-700 font-semibold">{t('app.plantTrees')} 🌱</span>
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">{t('app.version')}</span>
      </div>
    </footer>
  );
};

export default Footer;
