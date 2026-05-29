import { describe, expect, it } from "vitest";

import { getRememberedAccount, REMEMBER_ACCOUNT_KEY, setRememberedAccount } from "./remember-account";

function createStorage() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    }
  };
}

describe("remember account", () => {
  it("stores a trimmed account identifier when remember is enabled", () => {
    const storage = createStorage();

    setRememberedAccount(storage, " Night_Rider ", true);

    expect(storage.getItem(REMEMBER_ACCOUNT_KEY)).toBe("Night_Rider");
  });

  it("removes remembered account when remember is disabled", () => {
    const storage = createStorage();
    storage.setItem(REMEMBER_ACCOUNT_KEY, "night@example.com");

    setRememberedAccount(storage, "night@example.com", false);

    expect(storage.getItem(REMEMBER_ACCOUNT_KEY)).toBeNull();
  });

  it("returns an empty string when nothing is remembered", () => {
    expect(getRememberedAccount(createStorage())).toBe("");
  });
});
