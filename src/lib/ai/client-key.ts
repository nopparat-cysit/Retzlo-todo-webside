export const DEEPSEEK_STORAGE_KEY = "todo_deepseek_api_key";

/**
 * Retrieve user-supplied DeepSeek API key from localStorage if present.
 */
export function getClientDeepSeekKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem(DEEPSEEK_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

/**
 * Store or clear the client DeepSeek API key.
 */
export function setClientDeepSeekKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(DEEPSEEK_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(DEEPSEEK_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Return headers containing client-supplied DeepSeek API key if available.
 */
export function getAiAuthHeaders(): Record<string, string> {
  const key = getClientDeepSeekKey();
  return key ? { "x-deepseek-api-key": key } : {};
}
