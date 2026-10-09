import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { parseAiMessageBlocks } from "./ai-message-content";

describe("parseAiMessageBlocks", () => {
  it("groups headings, paragraphs, bullet and numbered lists", () => {
    const blocks = parseAiMessageBlocks(
      "## Summary\nBoard is **on track**.\nSecond line\n\n- one\n- two\n\n1. first\n2. second"
    );

    expect(blocks).toEqual([
      { kind: "heading", text: "Summary" },
      { kind: "paragraph", lines: ["Board is **on track**.", "Second line"] },
      { kind: "bullets", items: ["one", "two"] },
      { kind: "numbers", items: ["first", "second"] }
    ]);
  });

  it("drops empty paragraphs and normalizes CRLF", () => {
    expect(parseAiMessageBlocks("hello\r\n\r\n\r\nworld")).toEqual([
      { kind: "paragraph", lines: ["hello"] },
      { kind: "paragraph", lines: ["world"] }
    ]);
  });
});

describe("AI chat widget visual polish", () => {
  const widgetSource = readFileSync(new URL("./ai-chat-widget.tsx", import.meta.url), "utf8");
  const rendererSource = readFileSync(new URL("./ai-message-content.tsx", import.meta.url), "utf8");

  it("does not use emoji decorations or bouncing loaders", () => {
    expect(widgetSource).not.toMatch(/[📊💡⚠📝📍🤖✨]/u);
    expect(widgetSource).not.toContain("animate-bounce");
  });

  it("renders assistant replies via the safe markdown renderer and supports both languages", () => {
    expect(widgetSource).toContain("<AiMessageContent");
    expect(rendererSource).not.toContain("dangerouslySetInnerHTML");
    expect(widgetSource).toContain("useLanguage");
  });

  it("uses theme tokens instead of hardcoded stone palette for the draft-card panel", () => {
    expect(widgetSource).not.toContain("bg-stone-900");
    expect(widgetSource).not.toContain("border-stone-700");
  });
});
