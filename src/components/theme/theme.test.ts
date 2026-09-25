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

  it("eliminates black edge scroll fade hint in Light Mode", () => {
    const board = readFileSync(join(process.cwd(), "src/components/kanban/board.tsx"), "utf8");
    expect(board).toContain("from-[#fbfaf8]/90 dark:from-ink-950/80 to-transparent");

    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain('[data-theme="light"] .from-ink-950\\/80');
    expect(css).toContain("rgba(251, 250, 248, 0.9)");
  });

  it("maps all translucent bg-ink-950 and bg-ink-900 variants to clean paper in Light Mode", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain('[data-theme="light"] .bg-ink-950\\/35');
    expect(css).toContain('[data-theme="light"] .bg-ink-950\\/45');
    expect(css).toContain('[data-theme="light"] .bg-ink-950\\/92');
    expect(css).toContain('[data-theme="light"] .text-stone-50');
    expect(css).toContain('[data-theme="light"] .project-nav-link-active');
  });

  it("ensures ProjectNavLink has high-contrast text when active", () => {
    const link = readFileSync(join(process.cwd(), "src/components/project/project-nav-link.tsx"), "utf8");
    expect(link).toContain("text-stone-900 font-semibold dark:text-stone-100");
  });

  it("ensures SegmentedControl renders theme-adaptive containers and buttons", () => {
    const seg = readFileSync(join(process.cwd(), "src/components/ui/segmented-control.tsx"), "utf8");
    expect(seg).toContain("border-stone-200/90 bg-stone-100/90");
    expect(seg).toContain("dark:bg-ink-950/45");
  });

  it("ensures ColumnIconPicker renders soft paper wells and crisp tiles in Light Mode", () => {
    const picker = readFileSync(join(process.cwd(), "src/components/kanban/column-icon-picker.tsx"), "utf8");
    expect(picker).toContain("border-stone-200/90 bg-stone-100/80");
    expect(picker).toContain("dark:bg-ink-950/25");
  });

  it("ensures CardModal checklist items use light paper rows with readable text", () => {
    const modal = readFileSync(join(process.cwd(), "src/components/kanban/card-modal.tsx"), "utf8");
    expect(modal).toContain("border-stone-200/90 bg-stone-50/90 px-3 py-2 text-sm text-stone-800");
    expect(modal).toContain("dark:bg-ink-950/50");
  });

  it("ensures Milestone Reward card uses warm amber surfaces and high-contrast text", () => {
    const diary = readFileSync(join(process.cwd(), "src/components/diary/diary-list-panel.tsx"), "utf8");
    expect(diary).toContain("border-dusk-amber/35 bg-amber-50/70");
    expect(diary).toContain("dark:bg-ink-950/50");
  });

  it("ensures skeleton loading uses warm bone base and white shimmer in Light Mode", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain('[data-theme="light"] .skeleton-base');
    expect(css).toContain("#ede8df !important");

    const skeleton = readFileSync(join(process.cwd(), "src/components/ui/skeleton.tsx"), "utf8");
    expect(skeleton).toContain("skeleton-base");
    expect(skeleton).toContain("border-stone-200/90 bg-stone-100/70");
  });

  it("ensures floating dropdown menus and selects use warm paper and high-contrast typography in Light Mode", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain('[data-theme="light"] [data-radix-select-content]');
    expect(css).toContain("background-color: #faf7f2 !important;");
    expect(css).toContain('[data-theme="light"] [role="option"]:hover');
    expect(css).toContain("background-color: #ede7da !important;");
    expect(css).toContain('[data-theme="light"] .text-stone-700');
    expect(css).toContain("color: #292524 !important;");

    const selectComponent = readFileSync(join(process.cwd(), "src/components/ui/select.tsx"), "utf8");
    expect(selectComponent).toContain("bg-[#faf7f2]");
    expect(selectComponent).toContain("hover:bg-[#ede7da]");
  });

  it("normalizes native select appearance to avoid Mac Aqua system white styling", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain("-webkit-appearance: none;");
    expect(css).toContain("appearance: none;");

    const notesPanel = readFileSync(join(process.cwd(), "src/components/notes/notes-panel.tsx"), "utf8");
    expect(notesPanel).toContain("appearance-none");
  });
});


