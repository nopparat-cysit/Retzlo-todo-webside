import { describe, expect, it } from "vitest";

import {
  createOfficeKnowledgeSchema,
  createOfficeReportSchema,
  createOfficeRoutineSchema,
  createOfficeTaskSchema
} from "@/lib/office/validation";

const agentId = "11111111-1111-4111-8111-111111111111";
const threadId = "22222222-2222-4222-8222-222222222222";

describe("office validation", () => {
  it("accepts the V1 task statuses", () => {
    for (const status of ["QUEUED", "WORKING", "NEEDS_YOU", "DONE", "FAILED"]) {
      const parsed = createOfficeTaskSchema.parse({ agentId, threadId, title: "Task", description: "Do the thing", status });
      expect(parsed.status).toBe(status);
    }
  });

  it("defaults new tasks to QUEUED and rejects invalid status", () => {
    expect(createOfficeTaskSchema.parse({ agentId, title: "Task", description: "Do the thing" }).status).toBe("QUEUED");
    expect(() => createOfficeTaskSchema.parse({ agentId, title: "Task", description: "Do the thing", status: "WAITING" })).toThrow();
  });

  it("accepts reports routines diary memory and skill payloads", () => {
    expect(createOfficeReportSchema.parse({ agentId, title: "Brief", summary: "Short", content: "Long" }).title).toBe("Brief");
    expect(createOfficeRoutineSchema.parse({ agentId, title: "AI Morning Brief", prompt: "Summarize AI news", timeOfDay: "08:00" }).scheduleLabel).toBe("Daily");
    expect(createOfficeKnowledgeSchema.parse({ kind: "DIARY", agentId, content: "Learned something" }).kind).toBe("DIARY");
    expect(createOfficeKnowledgeSchema.parse({ kind: "MEMORY", agentId, title: "Preference", content: "Keep it short" }).kind).toBe("MEMORY");
    expect(createOfficeKnowledgeSchema.parse({ kind: "SKILL", agentId, name: "Brief", description: "Daily brief", trigger: "Morning", content: "# Skill" }).kind).toBe("SKILL");
  });

  it("rejects invalid routine time", () => {
    expect(() => createOfficeRoutineSchema.parse({ agentId, title: "Bad routine", prompt: "Do it", timeOfDay: "25:99" })).toThrow();
  });
});