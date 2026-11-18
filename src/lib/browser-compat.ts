/**
 * Generates a unique identifier without assuming Secure Context or modern Web Crypto support.
 */
export function safeRandomId(): string {
  const cryptoApi = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    try {
      return cryptoApi.randomUUID();
    } catch {
      // Fall through when randomUUID fails outside secure contexts
    }
  }

  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    try {
      const bytes = new Uint8Array(16);
      cryptoApi.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    } catch {
      // Fall through to non-crypto fallback
    }
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Safely reads a string value from localStorage during SSR or restricted browser storage contexts.
 */
export function safeLocalStorageGet(key: string): string | null {
  try {
    return getLocalStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/**
 * Safely writes a string value to localStorage without throwing on quota or security errors.
 */
export function safeLocalStorageSet(key: string, value: string): void {
  try {
    getLocalStorage()?.setItem(key, value);
  } catch {
    // Ignore storage quota and security restrictions
  }
}

/**
 * Safely removes a key from localStorage without throwing on restricted storage contexts.
 */
export function safeLocalStorageRemove(key: string): void {
  try {
    getLocalStorage()?.removeItem(key);
  } catch {
    // Ignore storage security restrictions
  }
}

/**
 * Subscribes to MediaQueryList change events with Safari < 14 addListener/removeListener fallback.
 */
export function subscribeMediaQuery(
  mql: MediaQueryList,
  listener: (e: MediaQueryListEvent) => void
): () => void {
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", listener);
    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", listener);
      }
    };
  }

  if (typeof mql.addListener === "function") {
    mql.addListener(listener);
    return () => {
      if (typeof mql.removeListener === "function") {
        mql.removeListener(listener);
      }
    };
  }

  return () => {};
}
