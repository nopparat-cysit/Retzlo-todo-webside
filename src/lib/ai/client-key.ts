export const AI_STORAGE_KEY = "todo_ai_api_key";
export const DEEPSEEK_STORAGE_KEY = "todo_deepseek_api_key"; // Legacy fallback
export const AI_MODEL_STORAGE_KEY = "todo_ai_model";

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
 * Retrieve user-selected AI model from localStorage if present.
 */
export function getClientAiModel(): string {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem(AI_MODEL_STORAGE_KEY) || "").trim();
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

/**
 * Store or clear the client AI model preference.
 */
export function setClientAiModel(model: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = model.trim();
    if (trimmed) {
      localStorage.setItem(AI_MODEL_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(AI_MODEL_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

// Aliases for backward compatibility
export const getClientDeepSeekKey = getClientAiKey;
export const setClientDeepSeekKey = setClientAiKey;

/**
 * Return headers containing client-supplied AI API key and model if available.
 */
export function getAiAuthHeaders(): Record<string, string> {
  const key = getClientAiKey();
  const model = getClientAiModel();
  const headers: Record<string, string> = {};

  if (key) {
    headers["x-ai-api-key"] = key;
    headers["x-deepseek-api-key"] = key;
  }
  if (model) {
    headers["x-ai-model"] = model;
  }

  return headers;
}
