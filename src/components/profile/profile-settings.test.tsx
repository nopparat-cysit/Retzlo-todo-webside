import React from "react";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/profile",
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/theme/theme-provider", () => ({
  useTheme: () => ({
    theme: "dark",
    resolvedTheme: "dark",
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}));

describe("Profile settings consistency", () => {
  it("renders ProfileClient using SettingsSection, SettingsRow, BackButton, and ThemeToggle", async () => {
    const { ProfileClient } = await import("./profile-client");

    const html = renderToString(
      React.createElement(ProfileClient, {
        user: {
          name: "Test User",
          username: "testuser",
          email: "test@example.com",
          avatar: null,
          bio: "Quiet workspace builder",
          status: "ONLINE",
          createdAt: new Date("2026-01-15T00:00:00.000Z"),
        },
      })
    );

    expect(html).toContain("Profile Settings");
    expect(html).toContain("Account");
    expect(html).toContain("Profile details");
    expect(html).toContain("Change password");
    expect(html).toContain("Save profile");
    expect(html).toContain("Update password");
    expect(html).toContain("test@example.com");
    expect(html).toContain("@testuser");
    expect(html).toContain('aria-label="Back"');
  });

  it("gates profile and password updates with ConfirmModal and useToast", () => {
    const clientSrc = readFileSync(join(process.cwd(), "src/components/profile/profile-client.tsx"), "utf8");
    const formSrc = readFileSync(join(process.cwd(), "src/components/profile/profile-form.tsx"), "utf8");
    const passwordSrc = readFileSync(join(process.cwd(), "src/components/profile/change-password-form.tsx"), "utf8");

    expect(clientSrc).toContain("<ThemeToggle variant=\"icon\" />");
    expect(clientSrc).toContain("<SettingsSection");
    expect(clientSrc).toContain("<SettingsRow");

    expect(formSrc).toContain("<ConfirmModal");
    expect(formSrc).toContain("useToast");
    expect(formSrc).toContain("toast({");
    expect(formSrc).toContain("<SettingsSection");
    expect(formSrc).toContain("<SettingsRow");

    expect(passwordSrc).toContain("<ConfirmModal");
    expect(passwordSrc).toContain("useToast");
    expect(passwordSrc).toContain("toast({");
    expect(passwordSrc).toContain("<SettingsSection");
    expect(passwordSrc).toContain("<SettingsRow");
  });
});
