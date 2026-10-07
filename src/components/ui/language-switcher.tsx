"use client";

import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { type SupportedLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "button" | "dropdown" | "segmented";
  className?: string;
}

export function LanguageSwitcher({ variant = "button", className }: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === "dropdown") {
    return (
      <div className={cn("px-3 py-2 space-y-1.5", className)}>
        <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-indigo-500 dark:text-dusk-lavender" />
            <span>Language / ภาษา</span>
          </span>
          <span className="font-mono text-[10px] uppercase text-stone-400">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer border",
              language === "en"
                ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-xs dark:border-dusk-lavender/40 dark:bg-dusk-lavender/20 dark:text-dusk-lavender"
                : "border-stone-200/80 bg-white/60 text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-stone-300 dark:hover:bg-white/10"
            )}
          >
            <span>🇬🇧 English</span>
            {language === "en" && <Check className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("th")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer border",
              language === "th"
                ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-xs dark:border-dusk-lavender/40 dark:bg-dusk-lavender/20 dark:text-dusk-lavender"
                : "border-stone-200/80 bg-white/60 text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-stone-300 dark:hover:bg-white/10"
            )}
          >
            <span>🇹🇭 ภาษาไทย</span>
            {language === "th" && <Check className="h-3 w-3" />}
          </button>
        </div>
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div className={cn("inline-flex items-center rounded-xl border border-stone-200/90 bg-stone-100/80 p-0.5 dark:border-white/10 dark:bg-white/[0.04]", className)}>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={cn(
            "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
            language === "en"
              ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          )}
        >
          <span>EN</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage("th")}
          className={cn(
            "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
            language === "th"
              ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          )}
        >
          <span>TH</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200/90 bg-white/90 px-2.5 text-xs font-semibold text-stone-700 hover:border-indigo-300 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.045] dark:text-stone-300 dark:hover:border-dusk-lavender/40 dark:hover:bg-white/10 transition cursor-pointer shadow-2xs",
        className
      )}
      title={language === "en" ? "Switch to Thai (ภาษาไทย)" : "Switch to English"}
      aria-label="Toggle language"
    >
      <Globe className="h-3.5 w-3.5 text-indigo-500 dark:text-dusk-lavender" />
      <span className="font-mono text-[11px] font-bold">
        {language === "en" ? "EN" : "TH"}
      </span>
    </button>
  );
}
