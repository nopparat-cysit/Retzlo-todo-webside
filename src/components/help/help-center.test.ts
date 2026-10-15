import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Help & System Guide integration", () => {
  it("renders AiChatTrigger to the left of UserProfilePopover and HelpButton to the right in ProjectShell", () => {
    const shellSource = readFileSync(
      join(process.cwd(), "src/components/project/project-shell.tsx"),
      "utf8"
    );
    expect(shellSource).toContain('import { AiChatTrigger } from "@/components/ai/ai-chat-trigger";');
    expect(shellSource).toContain('import { HelpButton } from "@/components/ui/help-button";');

    const chatTriggerIndex = shellSource.indexOf("<AiChatTrigger />");
    const profileIndex = shellSource.indexOf("<UserProfilePopover");
    const helpIndex = shellSource.indexOf("<HelpButton />");

    expect(chatTriggerIndex).toBeGreaterThan(-1);
    expect(profileIndex).toBeGreaterThan(-1);
    expect(helpIndex).toBeGreaterThan(-1);
    expect(chatTriggerIndex).toBeLessThan(profileIndex);
    expect(profileIndex).toBeLessThan(helpIndex);
  });

  it("renders UserProfilePopover, AiChatTrigger, and HelpButton in ProjectsDashboard", () => {
    const dashboardSource = readFileSync(
      join(process.cwd(), "src/components/project/projects-dashboard.tsx"),
      "utf8"
    );
    expect(dashboardSource).toContain("<UserProfilePopover");
    expect(dashboardSource).toContain("<AiChatTrigger");
    expect(dashboardSource).toContain("<HelpButton");
  });

  it("provides Help & System Guide navigation item in UserProfilePopover dropdown", () => {
    const popoverSource = readFileSync(
      join(process.cwd(), "src/components/project/user-profile-popover.tsx"),
      "utf8"
    );
    expect(popoverSource).toContain('href="/help"');
    expect(popoverSource).toContain("Help & System Guide");
  });

  it("includes /help page and rich HelpCenterClient with categories and search", () => {
    const pageSource = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/help/page.tsx"),
      "utf8"
    );
    const helpDir = join(process.cwd(), "src/components/help");
    const readHelpFiles = (dir: string): string => {
      let combined = "";
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          combined += readHelpFiles(fullPath);
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
          combined += readFileSync(fullPath, "utf8") + "\n";
        }
      }
      return combined;
    };
    const helpModuleSource = readHelpFiles(helpDir);

    expect(pageSource).toContain("HelpCenterClient");
    expect(helpModuleSource).toContain("ข้อมูลระบบ & คู่มือการใช้งาน");
    expect(helpModuleSource).toContain("ผู้ช่วยอัจฉริยะ Retzlo AI");
    expect(helpModuleSource).toContain("Spreadsheet Table View");
    expect(helpModuleSource).toContain("Card Density (Normal / Compact 2x)");
    expect(helpModuleSource).toContain("Hover Checkbox");
    expect(helpModuleSource).toContain("Coffee Cheers");
    expect(helpModuleSource).toContain("useAiChat");
  });

  it("provides system documentation and maintainer instructions in docs/system-guide.md and AGENTS.md", () => {
    const guideSource = readFileSync(
      join(process.cwd(), "docs/system-guide.md"),
      "utf8"
    );
    const agentsSource = readFileSync(
      join(process.cwd(), "AGENTS.md"),
      "utf8"
    );

    expect(guideSource).toContain("Retzlo System Guide & Knowledge Base");
    expect(guideSource).toContain("deepseek-v4-pro");
    expect(guideSource).toContain("Spreadsheet Table View");
    expect(agentsSource).toContain("System Documentation & Knowledge Base");
    expect(agentsSource).toContain("docs/system-guide.md");
  });
});
