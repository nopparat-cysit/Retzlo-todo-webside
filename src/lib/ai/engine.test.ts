import { describe, expect, it } from "vitest";
import { generateTaskBreakdown, generateProjectSummary, chatWithAssistant, getAiApiKey } from "./engine";

const REAL_KEY = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || "";
const SHOULD_RUN_LIVE = process.env.RUN_LIVE_AI_TESTS === "true" && Boolean(REAL_KEY);

describe("AI Assistant Engine", { timeout: 60000 }, () => {
  it("resolves AI_API_KEY or DEEPSEEK_API_KEY properly", () => {
    const key = getAiApiKey();
    expect(typeof key).toBe("string");
  });

  it.runIf(SHOULD_RUN_LIVE)("generates structured checklist breakdown for Pad Kra Pao with real AI engine", async () => {
    process.env.AI_API_KEY = REAL_KEY;
    const result = await generateTaskBreakdown({
      title: "Pad Kra Pao Recipe",
      description: "Spicy stir-fried minced pork with basil and chilies",
      depth: "standard"
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThanOrEqual(4);
    expect([1, 3, 5, 8]).toContain(result.suggestedDifficulty);
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(result.suggestedPriority);
  });

  it.runIf(SHOULD_RUN_LIVE)("generates 8-10 actionable steps for detailed software task", async () => {
    process.env.AI_API_KEY = REAL_KEY;
    const result = await generateTaskBreakdown({
      title: "Google OAuth Login Flow",
      description: "Configure NextAuth GoogleProvider and persist user sessions to PostgreSQL",
      depth: "detailed"
    });

    expect(result.items.length).toBeGreaterThanOrEqual(6);
    expect(result.items[0]).not.toMatch(/^\d+\./); // Verified sanitized without "1. "
  });

  it("handles fallback properly when API key is empty or missing", async () => {
    const originalAiKey = process.env.AI_API_KEY;
    const originalDeepseekKey = process.env.DEEPSEEK_API_KEY;
    delete process.env.AI_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    try {
      const result = await generateTaskBreakdown({
        title: "Test Task"
      });
      expect(result.items.length).toBeGreaterThan(0);
      expect([1, 3, 5, 8]).toContain(result.suggestedDifficulty);
    } finally {
      if (originalAiKey) process.env.AI_API_KEY = originalAiKey;
      if (originalDeepseekKey) process.env.DEEPSEEK_API_KEY = originalDeepseekKey;
    }
  });

  it("respects itemCount parameter when generating breakdown", async () => {
    const originalAiKey = process.env.AI_API_KEY;
    const originalDeepseekKey = process.env.DEEPSEEK_API_KEY;
    delete process.env.AI_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    try {
      const result = await generateTaskBreakdown({
        title: "Test Task with Custom Count",
        itemCount: 3
      });
      expect(result.items.length).toBe(3);
    } finally {
      if (originalAiKey) process.env.AI_API_KEY = originalAiKey;
      if (originalDeepseekKey) process.env.DEEPSEEK_API_KEY = originalDeepseekKey;
    }
  });

  it.runIf(SHOULD_RUN_LIVE)("generates executive project summary with health status", async () => {
    process.env.AI_API_KEY = REAL_KEY;
    const result = await generateProjectSummary({
      projectName: "Retro Workspace",
      boardName: "Sprint 1",
      totalCards: 10,
      todoCount: 3,
      doingCount: 4,
      waitingCount: 1,
      doneCount: 2,
      overdueCards: [{ title: "Fix login bug", priority: "HIGH" }],
      inProgressCards: [{ title: "Develop AI assistant", priority: "HIGH" }],
      doneCards: [{ title: "Database setup" }]
    });

    expect(result).toBeDefined();
    expect(["HEALTHY", "ATTENTION", "CRITICAL"]).toContain(result.healthStatus);
    expect(result.completionRatePercent).toBeGreaterThanOrEqual(0);
    expect(result.overview.length).toBeGreaterThan(0);
  });

  it("chatWithAssistant generates conversational response successfully", async () => {
    const originalAiKey = process.env.AI_API_KEY;
    const originalDeepseekKey = process.env.DEEPSEEK_API_KEY;
    delete process.env.AI_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    try {
      const reply = await chatWithAssistant({
        messages: [{ role: "user", content: "Hello, could you provide some task recommendations?" }]
      });
      expect(typeof reply).toBe("string");
      expect(reply.length).toBeGreaterThan(0);
    } finally {
      if (originalAiKey) process.env.AI_API_KEY = originalAiKey;
      if (originalDeepseekKey) process.env.DEEPSEEK_API_KEY = originalDeepseekKey;
    }
  });
});
