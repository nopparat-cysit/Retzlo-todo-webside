export const REMEMBER_ACCOUNT_KEY = "retrod.rememberedAccount";

interface RememberStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export function getRememberedAccount(storage: RememberStorage): string {
  return storage.getItem(REMEMBER_ACCOUNT_KEY) ?? "";
}

export function setRememberedAccount(storage: RememberStorage, identifier: string, remember: boolean) {
  if (!remember) {
    storage.removeItem(REMEMBER_ACCOUNT_KEY);
    return;
  }

  storage.setItem(REMEMBER_ACCOUNT_KEY, identifier.trim());
}
