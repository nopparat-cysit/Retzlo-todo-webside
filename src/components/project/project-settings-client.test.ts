import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(
  join(process.cwd(), "src/components/project/project-settings-client.tsx"),
  "utf8"
);

describe("ProjectSettingsClient Jira-style Master-Detail Architecture", () => {
  it("defines all required tabs including identity, access, boards, attributes, features, preferences, all", () => {
    expect(source).toContain('"identity"');
    expect(source).toContain('"access"');
    expect(source).toContain('"boards"');
    expect(source).toContain('"attributes"');
    expect(source).toContain('"features"');
    expect(source).toContain('"preferences"');
    expect(source).toContain('"all"');
  });

  it("organizes navigation into General, Workflow, System & Privacy, and Overview categories", () => {
    expect(source).toContain('title: "General"');
    expect(source).toContain('title: "Workflow"');
    expect(source).toContain('title: "System & Privacy"');
    expect(source).toContain('title: "Overview"');
  });

  it("renders Master-Detail sidebar layout on desktop with Back to board link", () => {
    expect(source).toContain("Back to board");
    expect(source).toContain("href={`/project/${projectId}/board`}");
    expect(source).toContain("lofi-panel");
    expect(source).toContain("Project Space");
  });

  it("integrates Access & Team management with direct link to project members page", () => {
    expect(source).toContain("Space Members");
    expect(source).toContain("href={`/project/${projectId}/members`}");
    expect(source).toContain("จัดการสมาชิกและคำเชิญ");
    expect(source).toContain("Avatar user={member.user}");
  });

  it("provides comprehensive Card Attributes & Workflow overview", () => {
    expect(source).toContain("TODO");
    expect(source).toContain("DOING");
    expect(source).toContain("WAITING");
    expect(source).toContain("DONE");
    expect(source).toContain("P0 - Urgent");
    expect(source).toContain("P1 - High");
    expect(source).toContain("P2 - Medium");
    expect(source).toContain("P3 - Low");
    expect(source).toContain("P4 - None");
    expect(source).toContain("Fibonacci Scale");
  });

  it("preserves SettingsForm and ProjectBoardsManager integrations", () => {
    expect(source).toContain("<ProjectBoardsManager");
    expect(source).toContain("<SettingsForm");
    expect(source).toContain("<SoundToggle");
  });

  it("integrates interactive BoardAttributesTab for direct Status, Priority, and Story Points configuration", () => {
    expect(source).toContain("<BoardAttributesTab");
    expect(source).toContain("boardId={selectedBoardId}");
    expect(source).toContain("initialSubTab={attributeSubTab}");
    expect(source).toContain("onPrioritiesChange={handlePrioritiesChange}");
  });

  it("integrates dedicated Jira-style Board General, Columns, and Danger tabs with active board switcher", () => {
    expect(source).toContain('"board-general"');
    expect(source).toContain('"board-columns"');
    expect(source).toContain("<BoardGeneralTab");
    expect(source).toContain("<BoardColumnsTab");
    expect(source).toContain("<BoardDangerTab");
    expect(source).toContain("onConfigureBoard={handleOpenBoardConfig}");
    expect(source).toContain("Active Board");
  });

  it("verifies card-modal.tsx + button links to project settings attributes tab", () => {
    const cardModalSource = readFileSync(
      join(process.cwd(), "src/components/kanban/card-modal.tsx"),
      "utf8"
    );
    expect(cardModalSource).toContain("handleOpenAttributesSetting");
    expect(cardModalSource).toContain('tab: "attributes"');
    expect(cardModalSource).toContain("/settings?");
  });
});
