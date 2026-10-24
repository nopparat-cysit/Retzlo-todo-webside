"use client";

import { useEffect, useState } from "react";
import { OmikujiDeskSettings, DEFAULT_OMIKUJI_SETTINGS, OmikujiFortuneItem } from "@/types/omikuji";
import { getAllFortunes } from "./omikuji-data";

const STORAGE_KEY = "retzlo_omikuji_settings";
const CUSTOM_FORTUNES_KEY = "retzlo_omikuji_custom_dataset";
const SETTINGS_EVENT = "retzlo_omikuji_settings_changed";

/**
 * Reads omikuji settings from localStorage safely (SSR-safe).
 */
export function getOmikujiSettings(): OmikujiDeskSettings {
  if (typeof window === "undefined") {
    return DEFAULT_OMIKUJI_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OMIKUJI_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_OMIKUJI_SETTINGS,
      ...parsed
    };
  } catch {
    return DEFAULT_OMIKUJI_SETTINGS;
  }
}

/**
 * Saves omikuji settings to localStorage and dispatches a change event.
 */
export function saveOmikujiSettings(patch: Partial<OmikujiDeskSettings>): OmikujiDeskSettings {
  if (typeof window === "undefined") {
    return DEFAULT_OMIKUJI_SETTINGS;
  }
  try {
    const current = getOmikujiSettings();
    const next: OmikujiDeskSettings = {
      ...current,
      ...patch
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: next }));
    return next;
  } catch (err) {
    console.error("Failed to save omikuji settings:", err);
    return DEFAULT_OMIKUJI_SETTINGS;
  }
}

/**
 * Reset settings to default and clear custom uploaded fortunes.
 */
export function resetOmikujiSettings(): OmikujiDeskSettings {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CUSTOM_FORTUNES_KEY);
      window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: DEFAULT_OMIKUJI_SETTINGS }));
    } catch (err) {
      console.error("Failed to reset omikuji settings:", err);
    }
  }
  return DEFAULT_OMIKUJI_SETTINGS;
}

/**
 * Save custom uploaded fortunes dataset.
 */
export function saveCustomOmikujiFortunes(filename: string, fortunes: OmikujiFortuneItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_FORTUNES_KEY, JSON.stringify(fortunes));
    saveOmikujiSettings({
      customCsvName: filename,
      customCsvUploadedAt: new Date().toISOString(),
      customFortunesCount: fortunes.length
    });
  } catch (err) {
    console.error("Failed to save custom fortunes:", err);
  }
}

/**
 * Get active fortunes (either custom or default 100).
 */
export function getActiveFortunes(): OmikujiFortuneItem[] {
  if (typeof window === "undefined") return getAllFortunes();
  try {
    const raw = localStorage.getItem(CUSTOM_FORTUNES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return getAllFortunes();
}

/**
 * React Hook for consuming and modifying Omikuji Desk settings.
 */
export function useOmikujiSettings() {
  const [settings, setSettings] = useState<OmikujiDeskSettings>(DEFAULT_OMIKUJI_SETTINGS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(getOmikujiSettings());
    setMounted(true);

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<OmikujiDeskSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getOmikujiSettings());
      }
    };

    window.addEventListener(SETTINGS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const update = (patch: Partial<OmikujiDeskSettings>) => {
    const next = saveOmikujiSettings(patch);
    setSettings(next);
    return next;
  };

  const reset = () => {
    const def = resetOmikujiSettings();
    setSettings(def);
    return def;
  };

  return {
    settings,
    mounted,
    update,
    reset
  };
}
