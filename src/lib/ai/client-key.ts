export const AI_STORAGE_KEY = "todo_ai_api_key";
export const DEEPSEEK_STORAGE_KEY = "todo_deepseek_api_key"; // Legacy fallback

/**
 * Retrieve user-supplied AI API key from localStorage if present.
 */
export function getClientAiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return (
      localStorage.getItem(AI_STORAGE_KEY) ||
      localStorage.getItem(DEEPSEEK_STORAGE_KEY) ||
      ""
    ).trim();
  } catch {
    return "";
  }
}

/**
 * Store or clear the client AI API key.
 */
export function setClientAiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(AI_STORAGE_KEY, trimmed);
      localStorage.setItem(DEEPSEEK_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(AI_STORAGE_KEY);
      localStorage.removeItem(DEEPSEEK_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

// Aliases for backward compatibility
export const getClientDeepSeekKey = getClientAiKey;
export const setClientDeepSeekKey = setClientAiKey;

/**
 * Return headers containing client-supplied AI API key if available.
 */
export function getAiAuthHeaders(): Record<string, string> {
  const key = getClientAiKey();
  return key
    ? {
        "x-ai-api-key": key,
        "x-deepseek-api-key": key
      }
    : {};
}
