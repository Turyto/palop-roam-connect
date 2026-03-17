import { createContext, useContext, useState } from 'react';
import translations, { Lang, Translations } from '@/lib/translations';

type NestedValue<T> = T extends object
  ? { [K in keyof T]: NestedValue<T[K]> }[keyof T]
  : T;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('palop-lang');
    return stored === 'en' ? 'en' : 'pt';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('palop-lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};
