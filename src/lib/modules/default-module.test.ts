import { describe, expect, it, beforeEach } from "vitest";
import {
  DEFAULT_MODULE_STORAGE_KEY,
  DEFAULT_MODULE_COOKIE_NAME,
  MODULE_ROUTES,
  getDefaultModule,
  setDefaultModule,
  getModuleHref,
  isValidModuleId
} from "./default-module";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe("default-module helper", () => {
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
  });

  it("maps valid module IDs to corresponding routes", () => {
    expect(getModuleHref("todo")).toBe("/projects");
    expect(getModuleHref("finance")).toBe("/finance");
    expect(getModuleHref("vital")).toBe("/hub");
    expect(getModuleHref("office")).toBe("/office");
    expect(getModuleHref("unknown")).toBe("/select-module");
    expect(getModuleHref("unknown", "/fallback")).toBe("/fallback");
  });

  it("validates module IDs correctly", () => {
    expect(isValidModuleId("todo")).toBe(true);
    expect(isValidModuleId("finance")).toBe(true);
    expect(isValidModuleId("vital")).toBe(true);
    expect(isValidModuleId("office")).toBe(true);
    expect(isValidModuleId("random")).toBe(false);
  });

  it("stores and retrieves the default module from storage", () => {
    expect(getDefaultModule(memoryStorage)).toBeNull();

    setDefaultModule("todo", memoryStorage);
    expect(getDefaultModule(memoryStorage)).toBe("todo");

    setDefaultModule("finance", memoryStorage);
    expect(getDefaultModule(memoryStorage)).toBe("finance");
  });

  it("clears the default module when null or invalid is provided", () => {
    setDefaultModule("todo", memoryStorage);
    expect(getDefaultModule(memoryStorage)).toBe("todo");

    setDefaultModule(null, memoryStorage);
    expect(getDefaultModule(memoryStorage)).toBeNull();
    expect(memoryStorage.getItem(DEFAULT_MODULE_STORAGE_KEY)).toBeNull();
  });

  it("ignores unknown module IDs and leaves storage empty", () => {
    setDefaultModule("fake-module", memoryStorage);
    expect(getDefaultModule(memoryStorage)).toBeNull();
  });
});
