import { describe, expect, it } from "vitest";
import { generateTaskBreakdown, generateProjectSummary } from "./deepseek";

const REAL_KEY = process.env.DEEPSEEK_API_KEY || "";

describe("DeepSeek AI Engine", () => {
  it.runIf(Boolean(REAL_KEY))("generates structured checklist breakdown for Pad Kra Pao with real DeepSeek engine", async () => {
    process.env.DEEPSEEK_API_KEY = REAL_KEY;
    const result = await generateTaskBreakdown({
      title: "วิธีทำผัดกะเพรา",
      description: "สูตรผัดกะเพราหมูสับ พริกแห้ง รสเด็ด",
      depth: "standard"
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThanOrEqual(4);
    expect([1, 3, 5, 8]).toContain(result.suggestedDifficulty);
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(result.suggestedPriority);
  });

  it.runIf(Boolean(REAL_KEY))("generates 8-10 actionable steps for detailed software task", async () => {
    process.env.DEEPSEEK_API_KEY = REAL_KEY;
    const result = await generateTaskBreakdown({
      title: "ทำระบบ Login ด้วย Google OAuth",
      description: "เชื่อมต่อ NextAuth GoogleProvider และบันทึกบัญชีลง PostgreSQL",
      depth: "detailed"
    });

    expect(result.items.length).toBeGreaterThanOrEqual(6);
    expect(result.items[0]).not.toMatch(/^\d+\./); // Verified sanitized without "1. "
  });

  it("handles fallback properly when API key is empty or missing", async () => {
    delete process.env.DEEPSEEK_API_KEY;
    try {
      const result = await generateTaskBreakdown({
        title: "Test Task"
      });
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.suggestedDifficulty).toBe(3);
    } finally {
      process.env.DEEPSEEK_API_KEY = REAL_KEY;
    }
  });

  it.runIf(Boolean(REAL_KEY))("generates executive project summary with health status", async () => {
    process.env.DEEPSEEK_API_KEY = REAL_KEY;
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
    expect(result.overview).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
});
