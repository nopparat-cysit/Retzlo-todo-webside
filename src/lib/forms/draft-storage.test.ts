import { beforeEach, describe, expect, it } from "vitest";
import {
  clearFormDraft,
  DRAFT_PREFIX,
  hasFormDraft,
  loadFormDraft,
  MAX_DRAFT_AGE_MS,
  saveFormDraft
} from "./draft-storage";

describe("draft-storage", () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    for (const k of Object.keys(store)) {
      delete store[k];
    }

    const mockStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      }
    };

    // Ensure window.localStorage exists in node test environment
    (globalThis as any).window = {
      localStorage: mockStorage
    };
  });

  it("saves and loads draft data with timestamp", () => {
    const data = { title: "Draft Task", count: 42 };
    saveFormDraft("test-key", data);

    expect(hasFormDraft("test-key")).toBe(true);
    const loaded = loadFormDraft<typeof data>("test-key");
    expect(loaded?.data).toEqual(data);
    expect(typeof loaded?.savedAt).toBe("number");
  });

  it("clears draft successfully", () => {
    saveFormDraft("clear-key", { text: "temp" });
    expect(hasFormDraft("clear-key")).toBe(true);

    clearFormDraft("clear-key");
    expect(hasFormDraft("clear-key")).toBe(false);
    expect(loadFormDraft("clear-key")).toBeNull();
  });

  it("discards expired drafts", () => {
    const expiredDraft = {
      data: { text: "old" },
      savedAt: Date.now() - (MAX_DRAFT_AGE_MS + 1000)
    };
    store[`${DRAFT_PREFIX}expired-key`] = JSON.stringify(expiredDraft);

    expect(loadFormDraft("expired-key")).toBeNull();
    expect(store[`${DRAFT_PREFIX}expired-key`]).toBeUndefined();
  });

  it("cleans up corrupted json gracefully", () => {
    store[`${DRAFT_PREFIX}corrupt-key`] = "invalid-json{{";
    expect(loadFormDraft("corrupt-key")).toBeNull();
    expect(store[`${DRAFT_PREFIX}corrupt-key`]).toBeUndefined();
  });
});
