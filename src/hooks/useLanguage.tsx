import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { translations, Lang, TranslationKey } from "@/i18n/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  tField: (fieldRu: string, fieldKz?: string | null, fieldEn?: string | null) => string;
}

const LANGUAGE_STORAGE_KEY = "balahub_lang";

const getSavedLanguage = (): Lang => {
  if (typeof localStorage === "undefined") return "ru";
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved === "ru" || saved === "kz" || saved === "en" ? saved : "ru";
};

const defaultLang: Lang = getSavedLanguage();

const fallbackContext: LanguageContextType = {
  lang: defaultLang,
  setLang: () => {},
  t: (key) => translations[key]?.[defaultLang] || translations[key]?.["ru"] || key,
  tField: (fieldRu, fieldKz, fieldEn) => {
    if (defaultLang === "kz" && fieldKz) return fieldKz;
    if (defaultLang === "en" && fieldEn) return fieldEn;
    return fieldRu;
  },
};

const LanguageContext = createContext<LanguageContextType>(fallbackContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    return getSavedLanguage();
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, l);
    document.documentElement.lang = l === "kz" ? "kk" : l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "kz" ? "kk" : lang;
  }, [lang]);

  const t = useCallback((key: TranslationKey) => {
    return translations[key]?.[lang] || translations[key]?.["ru"] || key;
  }, [lang]);

  const tField = useCallback((fieldRu: string, fieldKz?: string | null, fieldEn?: string | null) => {
    if (lang === "kz" && fieldKz) return fieldKz;
    if (lang === "en" && fieldEn) return fieldEn;
    return fieldRu;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tField }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
