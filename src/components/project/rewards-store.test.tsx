import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/project/proj-1/rewards",
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/ai/ai-chat-context", () => ({
  useAiChat: () => ({
    isOpen: false,
    viewMode: "sidepanel",
    isSmallScreen: false,
    isFabOpen: false,
    setIsFabOpen: vi.fn(),
  }),
}));

vi.mock("@/lib/i18n/language-context", () => ({
  useLanguage: () => ({ language: "en", setLanguage: vi.fn(), t: (k: string) => k }),
}));

vi.mock("@/components/theme/theme-provider", () => ({
  useTheme: () => ({
    theme: "dark",
    resolvedTheme: "dark",
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}));

describe("RewardsStore search bar visibility", () => {
  it("renders the search input inside project-scoped rewards store without standalone header", async () => {
    const { RewardsStore } = await import("./rewards-store");

    const html = renderToString(
      React.createElement(RewardsStore, {
        projectId: "proj-1",
        projectName: "Alpha",
        isProjectAdmin: true,
        userProjects: [{ id: "proj-1", name: "Alpha", isProjectAdmin: true }],
      })
    );

    const searchMatches = html.match(/aria-label="Search rewards"/g) ?? [];
    expect(searchMatches).toHaveLength(1);
    expect(html).not.toContain("Back to Workspaces");
  });

  it("renders the search input exactly once in standalone rewards store", async () => {
    const { RewardsStore } = await import("./rewards-store");

    const html = renderToString(
      React.createElement(RewardsStore, {
        userProjects: [{ id: "proj-1", name: "Alpha", isProjectAdmin: true }],
      })
    );

    const searchMatches = html.match(/aria-label="Search rewards"/g) ?? [];
    expect(searchMatches).toHaveLength(1);
    expect(html).toContain("Back to Workspaces");
  });
});
