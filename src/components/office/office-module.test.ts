import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const officeSource = readFileSync("src/components/office/office-module.tsx", "utf8");
const routeSource = readFileSync("src/app/(dashboard)/office/page.tsx", "utf8");
const schemaSource = readFileSync("prisma/schema.prisma", "utf8");

describe("Office module source", () => {
  it("stays lightweight and avoids game-engine imports", () => {
    expect(officeSource).not.toMatch(/phaser|kaboom|pixi|three/i);
  });

  it("keeps Office project selection inside the Office module", () => {
    expect(officeSource).toContain("Office project selector");
    expect(officeSource).toContain("/office?projectId=");
    expect(officeSource).not.toContain("@/components/project");
  });

  it("creates Office projects without importing another module UI", () => {
    expect(officeSource).toContain('fetch("/api/projects"');
    expect(officeSource).toContain('type: "WORK"');
    expect(officeSource).toContain('router.push(`/office?projectId=${data.project.id}`)');
    expect(officeSource).not.toContain("CreateProjectForm");
  });

  it("loads authenticated user projects and office payload for the dashboard", () => {
    expect(routeSource).toContain("getServerSession");
    expect(routeSource).toContain('redirect("/login")');
    expect(routeSource).toContain("prisma.project.findMany");
    expect(routeSource).toContain("getOfficePayload");
    expect(routeSource).toContain("databaseError");
  });

  it("is chat-first and keeps the visual office as a secondary layer", () => {
    expect(officeSource).toContain("What should I know now?");
    expect(officeSource).toContain("OfficeChat");
    expect(officeSource).toContain("visual only");
    expect(officeSource).toContain("Room follows real task state later.");
  });

  it("wires task report routine and knowledge actions through Office APIs", () => {
    expect(officeSource).toContain("/api/office/${projectId}/messages");
    expect(officeSource).toContain('endpoint: "tasks"');
    expect(officeSource).toContain('endpoint: "reports"');
    expect(officeSource).toContain('endpoint: "routines"');
    expect(officeSource).toContain('endpoint: "knowledge"');
    expect(officeSource).toContain('Run now');
    expect(officeSource).toContain('/run');
  });

  it("adds dedicated Office Work OS schema models", () => {
    expect(schemaSource).toContain("model OfficeAgent");
    expect(schemaSource).toContain("model OfficeThread");
    expect(schemaSource).toContain("model OfficeTask");
    expect(schemaSource).toContain("model OfficeReport");
    expect(schemaSource).toContain("model OfficeAgentDiaryEntry");
    expect(schemaSource).toContain("model OfficeAgentMemory");
  });
});