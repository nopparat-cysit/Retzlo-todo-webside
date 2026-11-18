import { safeLocalStorageGet, safeLocalStorageRemove, safeLocalStorageSet } from "@/lib/browser-compat";

export const REMEMBER_ACCOUNT_KEY = "retrod.rememberedAccount";

interface RememberStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export function getRememberedAccount(storage?: RememberStorage | null): string {
  if (!storage) {
    return safeLocalStorageGet(REMEMBER_ACCOUNT_KEY) ?? "";
  }
  try {
    return storage.getItem(REMEMBER_ACCOUNT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setRememberedAccount(
  storage: RememberStorage | null | undefined,
  identifier: string,
  remember: boolean
) {
  const trimmed = identifier.trim();
  if (!storage) {
    if (!remember) {
      safeLocalStorageRemove(REMEMBER_ACCOUNT_KEY);
      return;
    }
    safeLocalStorageSet(REMEMBER_ACCOUNT_KEY, trimmed);
    return;
  }

  try {
    if (!remember) {
      storage.removeItem(REMEMBER_ACCOUNT_KEY);
      return;
    }

    storage.setItem(REMEMBER_ACCOUNT_KEY, trimmed);
  } catch {
    // Ignore storage access restrictions
  }
}
