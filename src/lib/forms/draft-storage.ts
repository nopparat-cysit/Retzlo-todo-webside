export interface FormDraft<T> {
  data: T;
  savedAt: number;
}

export const DRAFT_PREFIX = "retzlo:draft:";
export const MAX_DRAFT_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Saves a form draft with timestamp to localStorage.
 */
export function saveFormDraft<T>(key: string, data: T): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const draft: FormDraft<T> = {
      data,
      savedAt: Date.now()
    };
    window.localStorage.setItem(`${DRAFT_PREFIX}${key}`, JSON.stringify(draft));
  } catch {
    // Gracefully handle storage quota or private browsing limits
  }
}

/**
 * Loads a form draft from localStorage, discarding expired or corrupted drafts.
 */
export function loadFormDraft<T>(key: string): FormDraft<T> | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(`${DRAFT_PREFIX}${key}`);
    if (!raw) return null;

    const draft = JSON.parse(raw) as FormDraft<T>;
    if (!draft || typeof draft.savedAt !== "number" || draft.data === undefined) {
      clearFormDraft(key);
      return null;
    }

    if (Date.now() - draft.savedAt > MAX_DRAFT_AGE_MS) {
      clearFormDraft(key);
      return null;
    }

    return draft;
  } catch {
    clearFormDraft(key);
    return null;
  }
}

/**
 * Removes a form draft from localStorage.
 */
export function clearFormDraft(key: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(`${DRAFT_PREFIX}${key}`);
  } catch {}
}

/**
 * Checks if a valid non-expired draft exists.
 */
export function hasFormDraft(key: string): boolean {
  return loadFormDraft(key) !== null;
}
