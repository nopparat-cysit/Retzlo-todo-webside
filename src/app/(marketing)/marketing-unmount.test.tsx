import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import { ThemeProvider } from "@/components/theme/theme-provider";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Marketing Page unmount test", () => {
  it("imports LandingPage without throwing ReferenceError", async () => {
    const mod = await import("./page");
    expect(mod.default).toBeDefined();
    const html = renderToString(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(mod.default)
      )
    );
    expect(html).toContain("Retzlo");
  });
});
