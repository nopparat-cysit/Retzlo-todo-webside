import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("AI Chat Responsive & Sidebar Layout", () => {
  it("defaults AI chat viewMode to sidepanel and tracks small screens in context", () => {
    const contextSource = readFileSync(new URL("./ai-chat-context.tsx", import.meta.url), "utf8");

    // Must default viewMode to sidepanel
    expect(contextSource).toContain('useState<AiChatViewMode>("sidepanel")');
    expect(contextSource).toContain("isSmallScreen");
    expect(contextSource).toContain("window.innerWidth < 1024");
    expect(contextSource).toContain("viewMode: \"sidepanel\"");
  });

  it("renders AI chat at bottom-right for float and small-screen, and sidebar for desktop sidepanel", () => {
    const widgetSource = readFileSync(new URL("./ai-chat-widget.tsx", import.meta.url), "utf8");

    expect(widgetSource).toContain("viewMode === \"float\" || isSmallScreen");
    // Float / small-screen mode must be positioned at bottom-right
    expect(widgetSource).toContain("fixed bottom-4 right-4 sm:bottom-6 sm:right-6");
    // Desktop sidepanel mode must be docked on the right
    expect(widgetSource).toContain("fixed top-0 right-0 bottom-0 w-[380px] sm:w-[450px]");
    // Tooltip reflects bottom-right floating mode
    expect(widgetSource).toContain("สลับเป็นกล่องแชทลอย (ขวาล่าง)");
  });

  it("shifts the Star FAB button above the chat when AI chat is open at bottom right", () => {
    const fabSource = readFileSync(new URL("../hub/fab-hub.tsx", import.meta.url), "utf8");

    expect(fabSource).toContain("useAiChat");
    expect(fabSource).toContain("isAiChatOpenAndFloat");
    expect(fabSource).toContain("isAiChatOpenAndSidebar");
    // Upward displacement above the chat widget
    expect(fabSource).toContain("bottom-[calc(min(560px,85vh)+1.5rem)] right-4 sm:bottom-[calc(min(560px,85vh)+2rem)] sm:right-6");
    // Sidebar avoidance on desktop
    expect(fabSource).toContain("lg:bottom-6 lg:right-[calc(450px+1.5rem)]");
    // Normal resting state when AI chat is closed
    expect(fabSource).toContain("bottom-4 right-4 sm:bottom-6 sm:right-6");
  });

  it("renders rainbow Gemini sparkle icon and transparent background on topbar triggers", () => {
    const triggerSource = readFileSync(new URL("./ai-chat-trigger.tsx", import.meta.url), "utf8");
    const helpSource = readFileSync(new URL("../ui/help-button.tsx", import.meta.url), "utf8");
    const iconSource = readFileSync(new URL("./gemini-sparkle-icon.tsx", import.meta.url), "utf8");

    // AI Trigger must use GeminiSparkleIcon and have no card box BG
    expect(triggerSource).toContain("GeminiSparkleIcon");
    expect(triggerSource).not.toContain("bg-white/[0.045]");
    expect(triggerSource).not.toContain("border-white/10");

    // Help Button must have no card box BG
    expect(helpSource).not.toContain("bg-white/[0.045]");
    expect(helpSource).not.toContain("border-white/10");

    // GeminiSparkleIcon must define rainbow gradient
    expect(iconSource).toContain("<linearGradient");
    expect(iconSource).toContain("#38bdf8");
    expect(iconSource).toContain("#fbbf24");
  });
});
