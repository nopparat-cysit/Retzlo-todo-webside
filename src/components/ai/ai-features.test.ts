import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const breakdownSource = readFileSync(new URL("./ai-breakdown-modal.tsx", import.meta.url), "utf8");
const summarySource = readFileSync(new URL("./ai-project-summary-modal.tsx", import.meta.url), "utf8");
const cardModalSource = readFileSync(new URL("../kanban/card-modal.tsx", import.meta.url), "utf8");
const boardSource = readFileSync(new URL("../kanban/board.tsx", import.meta.url), "utf8");

describe("AI Assistant UI Integration", () => {
  it("verifies AI Breakdown modal and direct card application", () => {
    expect(breakdownSource).toContain("AI Auto-Breakdown Task");
    expect(breakdownSource).toContain("fetch(\"/api/ai/breakdown\"");
    expect(breakdownSource).toContain("onApply");
    expect(breakdownSource).toContain("standard");
    expect(breakdownSource).toContain("detailed");
  });

  it("verifies CardModal integrates AI Breakdown without confirmation prompts for direct button action", () => {
    expect(cardModalSource).toContain("AI Breakdown");
    expect(cardModalSource).toContain("<AiBreakdownModal");
    expect(cardModalSource).toContain("handleApplyAiChecklist");
    // Direct application: sets checklist directly in form state
    expect(cardModalSource).toContain("setChecklist(newItems)");
  });

  it("verifies AI Project Summary modal and board toolbar trigger", () => {
    expect(summarySource).toContain("AI Summary");
    expect(summarySource).toContain("handleCopyMarkdown");
    expect(summarySource).toContain("handleSaveToNotes");
    expect(boardSource).toContain("AI Summary");
    expect(boardSource).toContain("<AiProjectSummaryModal");
  });
});
