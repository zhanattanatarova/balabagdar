import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations, Lang, TranslationKey } from "@/i18n/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  tField: (fieldRu: string, fieldKz?: string | null, fieldEn?: string | null) => string;
}

const defaultLang: Lang = (typeof localStorage !== "undefined" && (localStorage.getItem("balahub_lang") as Lang)) || "kz";

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
    const saved = localStorage.getItem("balahub_lang");
    return (saved as Lang) || "kz";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("balahub_lang", l);
  }, []);

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
