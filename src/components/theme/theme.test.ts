import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Theme system and Warm Paper Light Mode", () => {
  it("defines light mode CSS variables in globals.css", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain(':root[data-theme="light"]');
    expect(css).toContain("--background: #fbfaf8;");
    expect(css).toContain("--foreground: #1c1917;");
    expect(css).toContain("--panel: #ffffff;");
    expect(css).toContain("--border: #e7e2d9;");
  });

  it("includes contextual CSS mapping for light mode in globals.css", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain('[data-theme="light"] body');
    expect(css).toContain('[data-theme="light"] .lofi-panel');
    expect(css).toContain('[data-theme="light"] .text-stone-100');
    expect(css).toContain('[data-theme="light"] .bg-ink-950');
    expect(css).toContain('[data-theme="light"] article[id^="card-"]');
  });

  it("configures anti-FOUC script and ThemeProvider in layout.tsx", () => {
    const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
    expect(layout).toContain("suppressHydrationWarning");
    expect(layout).toContain("retzlo-theme");
    expect(layout).toContain("<ThemeProvider>");
  });

  it("keeps topbars clean while mounting ThemeToggle in user-profile-popover.tsx", () => {
    const shell = readFileSync(join(process.cwd(), "src/components/project/project-shell.tsx"), "utf8");
    expect(shell).not.toContain('<ThemeToggle');

    const dashboard = readFileSync(join(process.cwd(), "src/components/project/projects-dashboard.tsx"), "utf8");
    expect(dashboard).not.toContain('<ThemeToggle');
  });

  it("mounts ThemeToggle in user-profile-popover.tsx menu", () => {
    const popover = readFileSync(join(process.cwd(), "src/components/project/user-profile-popover.tsx"), "utf8");
    expect(popover).toContain('import { ThemeToggle } from "@/components/theme/theme-toggle";');
    expect(popover).toContain('<ThemeToggle variant="dropdown" />');
  });

  it("mounts ThemeToggle in project settings page personal preferences", () => {
    const settings = readFileSync(join(process.cwd(), "src/app/(dashboard)/project/[id]/settings/page.tsx"), "utf8");
    expect(settings).toContain('import { ThemeToggle } from "@/components/theme/theme-toggle";');
    expect(settings).toContain('<ThemeToggle variant="settings" />');
  });

  it("provides ThemeProvider with system, light, and dark mode support", () => {
    const provider = readFileSync(join(process.cwd(), "src/components/theme/theme-provider.tsx"), "utf8");
    expect(provider).toContain('localStorage.getItem(THEME_STORAGE_KEY)');
    expect(provider).toContain('root.setAttribute("data-theme", active)');
    expect(provider).toContain('prefers-color-scheme');
  });

  it("configures high-contrast accent typography and soft paper wells in Light Mode", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain('[data-theme="light"] .text-dusk-amber');
    expect(css).toContain('[data-theme="light"] .text-dusk-lavender');
    expect(css).toContain('[data-theme="light"] .text-dusk-cyan');
    expect(css).toContain('[data-theme="light"] .text-dusk-rose');
    expect(css).toContain('[data-theme="light"] .bg-black\\/20');
    expect(css).toContain('#ede7da');
  });

  it("ensures ProjectSupportColumn has 2xl:order-3 so main boards view stays in center column", () => {
    const dashboard = readFileSync(join(process.cwd(), "src/components/project/projects-dashboard.tsx"), "utf8");
    expect(dashboard).toContain('order-3 2xl:order-3');
  });
});

