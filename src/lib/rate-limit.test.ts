import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp, resetRateLimits } from "./rate-limit";

describe("Rate Limiting Utility", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests within the limit", () => {
    const res1 = checkRateLimit("user-test-1", { max: 3, windowMs: 1000 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit("user-test-1", { max: 3, windowMs: 1000 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit("user-test-1", { max: 3, windowMs: 1000 });
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("rejects requests exceeding the limit", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user-test-2", { max: 3, windowMs: 5000 });
    }

    const exceeded = checkRateLimit("user-test-2", { max: 3, windowMs: 5000 });
    expect(exceeded.success).toBe(false);
    expect(exceeded.remaining).toBe(0);
    expect(exceeded.reset).toBeGreaterThan(0);
  });

  it("isolates different keys independently", () => {
    for (let i = 0; i < 2; i++) {
      checkRateLimit("user-alice", { max: 2, windowMs: 5000 });
    }

    expect(checkRateLimit("user-alice", { max: 2, windowMs: 5000 }).success).toBe(false);
    expect(checkRateLimit("user-bob", { max: 2, windowMs: 5000 }).success).toBe(true);
  });

  it("extracts client IP from various headers", () => {
    const reqWithForwarded = new Request("http://localhost:3000", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" }
    });
    expect(getClientIp(reqWithForwarded)).toBe("203.0.113.195");

    const reqWithRealIp = new Request("http://localhost:3000", {
      headers: { "x-real-ip": "198.51.100.22" }
    });
    expect(getClientIp(reqWithRealIp)).toBe("198.51.100.22");

    const reqFallback = new Request("http://localhost:3000");
    expect(getClientIp(reqFallback)).toBe("127.0.0.1");
  });
});
