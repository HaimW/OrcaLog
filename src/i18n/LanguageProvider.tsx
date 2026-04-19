"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { t as translate } from "./index";

interface LanguageContextType {
  lang: string;
  dir: "rtl" | "ltr";
  setLang: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "he",
  dir: "rtl",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("he");
  const dir = lang === "he" ? "rtl" : "ltr";

  useEffect(() => {
    const saved = localStorage.getItem("orcalog_lang");
    if (saved === "he" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  const setLang = useCallback((newLang: string) => {
    setLangState(newLang);
    localStorage.setItem("orcalog_lang", newLang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(key, params, lang),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
