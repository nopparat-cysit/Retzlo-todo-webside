import { afterEach, describe, expect, it, vi } from "vitest";

import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
  safeRandomId,
  subscribeMediaQuery
} from "./browser-compat";

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("safeRandomId", () => {
  it("uses crypto.randomUUID when available", () => {
    const randomUUID = vi.fn(() => "11111111-2222-4333-8444-555555555555");
    vi.stubGlobal("crypto", { randomUUID });

    expect(safeRandomId()).toBe("11111111-2222-4333-8444-555555555555");
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  it("falls back to crypto.getRandomValues UUIDv4 when randomUUID is absent", () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = i + 1;
      }
      return bytes;
    });
    vi.stubGlobal("crypto", { getRandomValues });

    const id = safeRandomId();
    expect(getRandomValues).toHaveBeenCalledTimes(1);
    expect(id).toMatch(UUID_V4_PATTERN);
  });

  it("falls back to crypto.getRandomValues when randomUUID throws", () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.fill(0xff);
      return bytes;
    });
    vi.stubGlobal("crypto", {
      randomUUID: () => {
        throw new Error("Insecure context");
      },
      getRandomValues
    });

    const id = safeRandomId();
    expect(id).toMatch(UUID_V4_PATTERN);
  });

  it("falls back to Math.random id when crypto is unavailable or throws", () => {
    vi.stubGlobal("crypto", undefined);
    const idWithoutCrypto = safeRandomId();
    expect(idWithoutCrypto).toMatch(/^id-\d+-[a-z0-9]*$/);

    vi.stubGlobal("crypto", {
      getRandomValues: () => {
        throw new Error("Not supported");
      }
    });
    const idOnError = safeRandomId();
    expect(idOnError).toMatch(/^id-\d+-[a-z0-9]*$/);
  });
});

describe("safeLocalStorage helpers", () => {
  it("returns null and no-ops safely when window is undefined", () => {
    vi.stubGlobal("window", undefined);

    expect(safeLocalStorageGet("missing")).toBeNull();
    expect(() => safeLocalStorageSet("key", "value")).not.toThrow();
    expect(() => safeLocalStorageRemove("key")).not.toThrow();
  });

  it("reads, writes, and removes keys through window.localStorage", () => {
    const store = new Map<string, string>();
    const storage: Storage = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (key) => store.get(key) ?? null,
      key: (index) => Array.from(store.keys())[index] ?? null,
      removeItem: (key) => {
        store.delete(key);
      },
      setItem: (key, value) => {
        store.set(key, value);
      }
    };
    vi.stubGlobal("window", { localStorage: storage });

    expect(safeLocalStorageGet("k1")).toBeNull();
    safeLocalStorageSet("k1", "v1");
    expect(safeLocalStorageGet("k1")).toBe("v1");
    safeLocalStorageSet("empty", "");
    expect(safeLocalStorageGet("empty")).toBe("");
    safeLocalStorageRemove("k1");
    expect(safeLocalStorageGet("k1")).toBeNull();
  });

  it("swallows errors when accessing window.localStorage or storage methods throws", () => {
    const restrictedWindow = {};
    Object.defineProperty(restrictedWindow, "localStorage", {
      get() {
        throw new Error("SecurityError");
      }
    });
    vi.stubGlobal("window", restrictedWindow);

    expect(safeLocalStorageGet("k")).toBeNull();
    expect(() => safeLocalStorageSet("k", "v")).not.toThrow();
    expect(() => safeLocalStorageRemove("k")).not.toThrow();

    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("SecurityError");
        },
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
        removeItem: () => {
          throw new Error("SecurityError");
        }
      }
    });

    expect(safeLocalStorageGet("k")).toBeNull();
    expect(() => safeLocalStorageSet("k", "v")).not.toThrow();
    expect(() => safeLocalStorageRemove("k")).not.toThrow();
  });
});

describe("subscribeMediaQuery", () => {
  it("uses addEventListener and removeEventListener when supported", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const listener = vi.fn();

    const mql = {
      addEventListener,
      removeEventListener
    } as unknown as MediaQueryList;

    const unsubscribe = subscribeMediaQuery(mql, listener);
    expect(addEventListener).toHaveBeenCalledWith("change", listener);

    unsubscribe();
    expect(removeEventListener).toHaveBeenCalledWith("change", listener);
  });

  it("falls back to addListener and removeListener on older Safari", () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();
    const listener = vi.fn();

    const mql = {
      addListener,
      removeListener
    } as unknown as MediaQueryList;

    const unsubscribe = subscribeMediaQuery(mql, listener);
    expect(addListener).toHaveBeenCalledWith(listener);

    unsubscribe();
    expect(removeListener).toHaveBeenCalledWith(listener);
  });

  it("returns a safe no-op cleanup if neither subscription API exists", () => {
    const mql = {} as unknown as MediaQueryList;
    const unsubscribe = subscribeMediaQuery(mql, vi.fn());
    expect(() => unsubscribe()).not.toThrow();
  });
});
