import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'sw';
type CurrencyCode = 'TZS' | 'USD' | 'EUR' | 'GBP';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  currency: CurrencyCode; // Change from string to CurrencyCode
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'E-MTAA Portal',
    'app.tagline': 'Digital Government Services',
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.applications': 'Applications',
    'nav.myApplications': 'My Applications',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    // Add more translations as needed
  },
  sw: {
    'app.name': 'Lango la E-MTAA',
    'app.tagline': 'Huduma za Kiserikali za Kidijitali',
    'nav.home': 'Nyumbani',
    'nav.services': 'Huduma',
    'nav.applications': 'Maombi',
    'nav.myApplications': 'Maombi Yangu',
    'nav.profile': 'Wasifu',
    'nav.dashboard': 'Dashibodi',
    'nav.logout': 'Toka',
    'nav.login': 'Ingia',
    'nav.signup': 'Jisajili',
    // Add more translations as needed
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved && (saved === 'en' || saved === 'sw') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  // Return proper CurrencyCode type
  const currency: CurrencyCode = 'TZS';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, currency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};