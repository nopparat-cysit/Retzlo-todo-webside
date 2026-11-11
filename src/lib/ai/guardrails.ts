import { AiChatMessage } from "./engine";

interface RateLimitRecord {
  timestamps: number[];
}

const ipStore = new Map<string, RateLimitRecord>();

export const RATE_LIMITS = {
  PER_MINUTE: 6,
  PER_DAY: 30,
  WINDOW_MINUTE_MS: 60 * 1000,
  WINDOW_DAY_MS: 24 * 60 * 60 * 1000
} as const;

export interface RateLimitResult {
  allowed: boolean;
  error?: string;
  remaining?: number;
}

export function checkPublicRateLimit(
  ip: string,
  now: number = Date.now()
): RateLimitResult {
  const normalizedIp = ip.trim() || "127.0.0.1";
  let record = ipStore.get(normalizedIp);

  if (!record) {
    record = { timestamps: [] };
    ipStore.set(normalizedIp, record);
  }

  // Purge entries older than 24 hours
  record.timestamps = record.timestamps.filter(
    (t) => now - t < RATE_LIMITS.WINDOW_DAY_MS
  );

  // Check 1-minute window
  const minuteCount = record.timestamps.filter(
    (t) => now - t < RATE_LIMITS.WINDOW_MINUTE_MS
  ).length;

  if (minuteCount >= RATE_LIMITS.PER_MINUTE) {
    return {
      allowed: false,
      error: "Rate limit reached: Maximum 6 questions per minute on Retzlo public guide. Please wait a moment.",
      remaining: 0
    };
  }

  // Check 24-hour window
  const dayCount = record.timestamps.length;
  if (dayCount >= RATE_LIMITS.PER_DAY) {
    return {
      allowed: false,
      error: "Daily rate limit reached: Maximum 30 questions per 24 hours on Retzlo public guide. Please sign in to continue with full workspace AI.",
      remaining: 0
    };
  }

  // Record this request
  record.timestamps.push(now);

  const remainingMinute = RATE_LIMITS.PER_MINUTE - (minuteCount + 1);
  const remainingDay = RATE_LIMITS.PER_DAY - (dayCount + 1);

  return {
    allowed: true,
    remaining: Math.min(remainingMinute, remainingDay)
  };
}

export function resetPublicRateLimits(): void {
  ipStore.clear();
}

export interface InputValidationResult {
  isValid: boolean;
  error?: string;
}

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions/i,
  /system\s+prompt/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /\bdan\s+mode\b/i,
  /you\s+are\s+now\s+an\s+unrestricted/i,
  /disregard\s+(?:all\s+)?(?:guidelines|rules)/i,
  /reveal\s+(?:your\s+)?(?:instructions|system\s+prompt|api\s*key)/i,
  /bypass\s+(?:content\s+)?filter/i,
  /simulate\s+(?:evil|unfiltered|jailbroken)/i
];

export function validatePublicInput(
  content: string,
  maxInputChars = 600
): InputValidationResult {
  const trimmed = (content || "").trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: "Message content cannot be empty."
    };
  }

  if (trimmed.length > maxInputChars) {
    return {
      isValid: false,
      error: `Message exceeds maximum allowed length of ${maxInputChars} characters for public guide.`
    };
  }

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: "I am Retzlo's product guide. I can only assist with questions regarding Retzlo and its features."
      };
    }
  }

  return {
    isValid: true
  };
}

export function prunePublicMessageHistory(
  messages: AiChatMessage[],
  historyLimit = 4
): AiChatMessage[] {
  if (!messages || messages.length === 0) {
    return [];
  }

  // Sanitize excessive whitespace across all messages
  const sanitized = messages.map((msg) => ({
    role: msg.role,
    content: msg.content
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }));

  const systemMsg = sanitized.find((m) => m.role === "system");
  const nonSystem = sanitized.filter((m) => m.role !== "system");

  // Keep at most historyLimit conversation turns
  const prunedNonSystem = nonSystem.slice(-historyLimit);

  if (systemMsg) {
    return [systemMsg, ...prunedNonSystem];
  }

  return prunedNonSystem;
}
