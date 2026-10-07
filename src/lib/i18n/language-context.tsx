"use client";

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { TRANSLATIONS, type SupportedLanguage, type TranslationDictionary } from "./translations";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
}

const STORAGE_KEY = "retzlo_language";
const DEFAULT_LANGUAGE: SupportedLanguage = "en";

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: TRANSLATIONS[DEFAULT_LANGUAGE],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (saved === "en" || saved === "th") {
        setLanguageState(saved);
        document.documentElement.setAttribute("lang", saved);
      } else {
        // Default to English as requested
        setLanguageState(DEFAULT_LANGUAGE);
        document.documentElement.setAttribute("lang", DEFAULT_LANGUAGE);
      }
    } catch {
      // Fallback in case of restricted localStorage
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "en" || e.newValue === "th")) {
        setLanguageState(e.newValue as SupportedLanguage);
        document.documentElement.setAttribute("lang", e.newValue);
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLanguage>;
      if (customEvent.detail === "en" || customEvent.detail === "th") {
        setLanguageState(customEvent.detail);
        document.documentElement.setAttribute("lang", customEvent.detail);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("retzlo:language-changed", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("retzlo:language-changed", handleCustomChange);
    };
  }, []);

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.setAttribute("lang", newLang);
      window.dispatchEvent(new CustomEvent("retzlo:language-changed", { detail: newLang }));
    } catch {
      // Ignore storage errors
    }
  };

  const toggleLanguage = () => {
    const nextLang: SupportedLanguage = language === "en" ? "th" : "en";
    setLanguage(nextLang);
  };

  const t = useMemo(() => {
    return TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
