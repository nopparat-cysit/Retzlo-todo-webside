import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isChunkLoadError,
  triggerChunkReload,
  clearChunkReloadFlag,
  CHUNK_RELOAD_STORAGE_KEY,
  CHUNK_RELOAD_COOLDOWN_MS,
} from "./chunk-recovery";

describe("chunk-recovery utility", () => {
  describe("isChunkLoadError", () => {
    it("returns false for non-error inputs", () => {
      expect(isChunkLoadError(null)).toBe(false);
      expect(isChunkLoadError(undefined)).toBe(false);
      expect(isChunkLoadError(0)).toBe(false);
      expect(isChunkLoadError("")).toBe(false);
      expect(isChunkLoadError(false)).toBe(false);
      expect(isChunkLoadError({})).toBe(false);
    });

    it("returns false for standard unrelated errors", () => {
      expect(isChunkLoadError(new Error("Database connection refused"))).toBe(false);
      expect(isChunkLoadError(new TypeError("Cannot read properties of undefined"))).toBe(false);
      expect(isChunkLoadError({ message: "Network timeout" })).toBe(false);
    });

    it("detects error with name ChunkLoadError", () => {
      const err = new Error("Something failed");
      err.name = "ChunkLoadError";
      expect(isChunkLoadError(err)).toBe(true);
    });

    it("detects errors with loading chunk message", () => {
      expect(isChunkLoadError(new Error("Loading chunk 842 failed."))).toBe(true);
      expect(isChunkLoadError(new Error("loading chunk app/page failed"))).toBe(true);
    });

    it("detects dynamically imported module failures", () => {
      expect(
        isChunkLoadError(
          new Error("Failed to fetch dynamically imported module: https://example.com/assets/entry.js")
        )
      ).toBe(true);
    });

    it("detects load chunk failed message", () => {
      expect(isChunkLoadError(new Error("load chunk failed"))).toBe(true);
    });

    it("detects loading css chunk failure", () => {
      expect(isChunkLoadError(new Error("Loading CSS chunk 302 failed"))).toBe(true);
    });

    it("detects chunk errors in string format", () => {
      expect(isChunkLoadError("ChunkLoadError: Loading chunk 91 failed")).toBe(true);
      expect(isChunkLoadError("failed to fetch dynamically imported module")).toBe(true);
    });

    it("detects nested error in PromiseRejectionEvent reason", () => {
      const rejectionEvent = {
        reason: new Error("Loading chunk 111 failed."),
      };
      expect(isChunkLoadError(rejectionEvent)).toBe(true);
    });

    it("detects nested error in ErrorEvent error property", () => {
      const errorEvent = {
        error: new Error("Failed to fetch dynamically imported module"),
      };
      expect(isChunkLoadError(errorEvent)).toBe(true);
    });

    it("detects script or link failure targeting Next.js static chunks", () => {
      const scriptEvent = {
        target: {
          tagName: "SCRIPT",
          src: "https://retzlo.vercel.app/_next/static/chunks/main-app.js",
        },
      };
      expect(isChunkLoadError(scriptEvent)).toBe(true);

      const linkEvent = {
        target: {
          tagName: "LINK",
          href: "https://retzlo.vercel.app/_next/static/css/global.css",
        },
      };
      expect(isChunkLoadError(linkEvent)).toBe(true);
    });

    it("ignores script failure targeting external sources", () => {
      const externalScript = {
        target: {
          tagName: "SCRIPT",
          src: "https://www.google-analytics.com/analytics.js",
        },
      };
      expect(isChunkLoadError(externalScript)).toBe(false);
    });
  });

  describe("triggerChunkReload and clearChunkReloadFlag", () => {
    let mockSessionStorage: Record<string, string>;
    let reloadMock: ReturnType<typeof vi.fn>;
    const originalWindow = global.window;

    beforeEach(() => {
      vi.useFakeTimers();
      mockSessionStorage = {};
      reloadMock = vi.fn();

      const fakeStorage = {
        getItem: (key: string) => mockSessionStorage[key] ?? null,
        setItem: (key: string, val: string) => {
          mockSessionStorage[key] = String(val);
        },
        removeItem: (key: string) => {
          delete mockSessionStorage[key];
        },
        clear: () => {
          mockSessionStorage = {};
        },
      };

      // @ts-expect-error Mocking partial window for Node testing
      global.window = {
        location: {
          reload: reloadMock,
        },
        sessionStorage: fakeStorage,
      };
    });

    afterEach(() => {
      vi.useRealTimers();
      global.window = originalWindow;
    });

    it("triggers reload on first invocation and records timestamp", () => {
      const now = 1000000;
      vi.setSystemTime(now);

      const result = triggerChunkReload();
      expect(result).toBe(true);
      expect(reloadMock).toHaveBeenCalledTimes(1);
      expect(mockSessionStorage[CHUNK_RELOAD_STORAGE_KEY]).toBe(String(now));
    });

    it("rate limits reload within the cooldown window (20 seconds)", () => {
      const now = 1000000;
      vi.setSystemTime(now);

      const firstCall = triggerChunkReload();
      expect(firstCall).toBe(true);
      expect(reloadMock).toHaveBeenCalledTimes(1);

      // Advance by 10 seconds (cooldown is 20s)
      vi.setSystemTime(now + 10000);
      const secondCall = triggerChunkReload();
      expect(secondCall).toBe(false);
      expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it("bypasses rate limit when force is true", () => {
      const now = 1000000;
      vi.setSystemTime(now);

      triggerChunkReload();
      expect(reloadMock).toHaveBeenCalledTimes(1);

      // Immediately force reload
      vi.setSystemTime(now + 1000);
      const forcedCall = triggerChunkReload(true);
      expect(forcedCall).toBe(true);
      expect(reloadMock).toHaveBeenCalledTimes(2);
      expect(mockSessionStorage[CHUNK_RELOAD_STORAGE_KEY]).toBe(String(now + 1000));
    });

    it("allows reload after cooldown expires", () => {
      const now = 1000000;
      vi.setSystemTime(now);

      triggerChunkReload();
      expect(reloadMock).toHaveBeenCalledTimes(1);

      // Advance past cooldown (20,001 ms)
      vi.setSystemTime(now + CHUNK_RELOAD_COOLDOWN_MS + 1);
      const thirdCall = triggerChunkReload();
      expect(thirdCall).toBe(true);
      expect(reloadMock).toHaveBeenCalledTimes(2);
    });

    it("clears reload flag safely", () => {
      mockSessionStorage[CHUNK_RELOAD_STORAGE_KEY] = "1000000";
      expect(mockSessionStorage[CHUNK_RELOAD_STORAGE_KEY]).toBeDefined();

      clearChunkReloadFlag();
      expect(mockSessionStorage[CHUNK_RELOAD_STORAGE_KEY]).toBeUndefined();
    });

    it("handles sessionStorage throw without breaking execution", () => {
      // @ts-expect-error Mock restricted storage
      global.window.sessionStorage = {
        getItem: () => {
          throw new Error("QuotaExceeded / Access Denied");
        },
        setItem: () => {
          throw new Error("QuotaExceeded / Access Denied");
        },
        removeItem: () => {
          throw new Error("QuotaExceeded / Access Denied");
        },
      };

      expect(() => triggerChunkReload()).not.toThrow();
      expect(() => clearChunkReloadFlag()).not.toThrow();
    });
  });
});
