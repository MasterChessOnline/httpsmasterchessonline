import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { DICTS, Lang, LANG_NAMES } from "./translations";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
  langs: typeof LANG_NAMES;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "mc.lang.v1";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored && stored in DICTS) return stored;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => {
    const dict = DICTS[lang];
    const fallback = DICTS.en;
    return {
      lang,
      setLang: setLangState,
      langs: LANG_NAMES,
      t: (key, fb) => dict[key] || fallback[key] || fb || key,
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
