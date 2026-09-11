export const DEFAULT_MODULE_STORAGE_KEY = "retzlo:default-module";
export const DEFAULT_MODULE_COOKIE_NAME = "retzlo_default_module";

export const MODULE_ROUTES: Record<string, string> = {
  todo: "/projects",
  finance: "/finance",
  vital: "/hub",
  office: "/office",
};

export function isValidModuleId(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(MODULE_ROUTES, id);
}

export function getModuleHref(moduleId: string, fallback = "/select-module"): string {
  return MODULE_ROUTES[moduleId] ?? fallback;
}

export function getDefaultModule(storage?: Storage): string | null {
  if (typeof window === "undefined" && !storage) return null;
  const store = storage ?? window.localStorage;
  try {
    const value = store.getItem(DEFAULT_MODULE_STORAGE_KEY);
    if (value && isValidModuleId(value)) {
      return value;
    }
  } catch {}
  return null;
}

export function setDefaultModule(moduleId: string | null, storage?: Storage): void {
  const store = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);

  if (moduleId && isValidModuleId(moduleId)) {
    try {
      store?.setItem(DEFAULT_MODULE_STORAGE_KEY, moduleId);
    } catch {}
    if (typeof document !== "undefined") {
      document.cookie = `${DEFAULT_MODULE_COOKIE_NAME}=${encodeURIComponent(moduleId)}; path=/; max-age=31536000; SameSite=Lax`;
    }
  } else {
    try {
      store?.removeItem(DEFAULT_MODULE_STORAGE_KEY);
    } catch {}
    if (typeof document !== "undefined") {
      document.cookie = `${DEFAULT_MODULE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    }
  }
}
