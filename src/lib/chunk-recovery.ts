export const CHUNK_RELOAD_STORAGE_KEY = "retzlo_chunk_retry_timestamp";
export const CHUNK_RELOAD_COOLDOWN_MS = 20000;

interface ErrorLike {
  name?: string;
  message?: string;
  stack?: string;
  reason?: unknown;
  error?: unknown;
  target?: unknown;
  type?: string;
}

/**
 * Checks whether an error, rejection, or event represents a ChunkLoadError
 * or dynamic script/chunk import failure.
 */
export function isChunkLoadError(err: unknown): boolean {
  if (err == null) {
    return false;
  }

  if (typeof err === "string") {
    return matchesChunkPattern(err);
  }

  if (typeof err === "object") {
    const candidate = err as ErrorLike;

    if (typeof candidate.name === "string" && candidate.name.toLowerCase() === "chunkloaderror") {
      return true;
    }

    if (typeof candidate.message === "string" && matchesChunkPattern(candidate.message)) {
      return true;
    }

    if (typeof candidate.stack === "string" && matchesChunkPattern(candidate.stack)) {
      return true;
    }

    if (candidate.reason !== undefined && candidate.reason !== err) {
      if (isChunkLoadError(candidate.reason)) {
        return true;
      }
    }

    if (candidate.error !== undefined && candidate.error !== err) {
      if (isChunkLoadError(candidate.error)) {
        return true;
      }
    }

    const target = candidate.target as { tagName?: string; src?: string; href?: string } | undefined;
    if (target && typeof target === "object") {
      const src = typeof target.src === "string" ? target.src : "";
      const href = typeof target.href === "string" ? target.href : "";
      if (src.includes("/_next/static/") || href.includes("/_next/static/")) {
        return true;
      }
    }
  }

  return false;
}

function matchesChunkPattern(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("chunkloaderror") ||
    normalized.includes("loading chunk") ||
    normalized.includes("failed to fetch dynamically imported module") ||
    normalized.includes("load chunk failed") ||
    normalized.includes("loading css chunk")
  );
}

/**
 * Safely triggers a window reload if within acceptable rate-limit bounds (20s).
 * Returns true if reload was dispatched, false if throttled or unavailable.
 */
export function triggerChunkReload(force: boolean = false): boolean {
  if (typeof window === "undefined" || !window.location) {
    return false;
  }

  const now = Date.now();

  try {
    if (!force && typeof window.sessionStorage !== "undefined") {
      const stored = window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY);
      if (stored) {
        const lastReload = parseInt(stored, 10);
        if (!Number.isNaN(lastReload) && now - lastReload < CHUNK_RELOAD_COOLDOWN_MS) {
          return false;
        }
      }
    }
  } catch {
    // SessionStorage may be restricted in private browsing; proceed with reload if forced or best-effort
  }

  try {
    if (typeof window.sessionStorage !== "undefined") {
      window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
    }
  } catch {
    // Ignore storage write failures
  }

  try {
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears the session storage cooldown flag once execution has stabilized.
 */
export function clearChunkReloadFlag(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    window.sessionStorage.removeItem(CHUNK_RELOAD_STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }
}
