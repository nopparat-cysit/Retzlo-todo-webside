interface RateLimitRecord {
  timestamps: number[];
}

// In-memory store for rate limiting
const store = new Map<string, RateLimitRecord>();

// Cleanup interval: prune keys older than 1 hour every 10 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function pruneExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const expiryCutoff = now - windowMs;
  for (const [key, record] of store.entries()) {
    const validTimestamps = record.timestamps.filter((ts) => ts > expiryCutoff);
    if (validTimestamps.length === 0) {
      store.delete(key);
    } else {
      record.timestamps = validTimestamps;
    }
  }
}

export interface RateLimitOptions {
  /**
   * Maximum allowed requests in the sliding window.
   */
  max: number;
  /**
   * Time window in milliseconds.
   */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks and increments the rate limit for a specific key.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { max, windowMs } = options;
  const now = Date.now();
  const windowStart = now - windowMs;

  pruneExpired(windowMs);

  const record = store.get(key) ?? { timestamps: [] };
  // Keep only timestamps within the current sliding window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= max) {
    const oldest = activeTimestamps[0];
    const resetTime = oldest ? oldest + windowMs : now + windowMs;
    return {
      success: false,
      limit: max,
      remaining: 0,
      reset: Math.ceil((resetTime - now) / 1000)
    };
  }

  activeTimestamps.push(now);
  store.set(key, { timestamps: activeTimestamps });

  return {
    success: true,
    limit: max,
    remaining: Math.max(0, max - activeTimestamps.length),
    reset: Math.ceil(windowMs / 1000)
  };
}

/**
 * Reset helper (mainly for test suites)
 */
export function resetRateLimits(): void {
  store.clear();
}

/**
 * Extracts client IP from standard Next.js request headers.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}
