import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { kn } from './kn';

const LanguageContext = createContext();

const translations = { en, kn };

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = (selectedLang) => {
    if (selectedLang) {
      setLang(selectedLang);
    } else {
      setLang((prev) => (prev === 'en' ? 'kn' : 'en'));
    }
  };

  const t = (keyPath, fallback = '') => {
    const keys = keyPath.split('.');
    let current = translations[lang];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if translation key is missing in Kannada
        let engCurrent = translations['en'];
        for (const k of keys) {
          if (engCurrent && engCurrent[k] !== undefined) {
            engCurrent = engCurrent[k];
          } else {
            return fallback || keyPath;
          }
        }
        return engCurrent;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
