import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(
  join(process.cwd(), "src/components/project/project-settings-client.tsx"),
  "utf8"
);
const settingsFormSource = readFileSync(
  join(process.cwd(), "src/components/project/settings-form.tsx"),
  "utf8"
);

describe("ProjectSettingsClient scope-grouped settings architecture", () => {
  it("defines the consolidated tabs and drops the unbounded 'all' view", () => {
    for (const tab of ["identity", "access", "boards", "board-general", "board-columns", "attributes", "preferences"]) {
      expect(source).toContain(`id: "${tab}"`);
    }
    expect(source).not.toContain('id: "all"');
    expect(source).not.toContain('id: "features"');
  });

  it("groups navigation by scope: Project, Boards, Personal", () => {
    expect(source).toContain('title: "Project"');
    expect(source).toContain('title: "Boards"');
    expect(source).toContain('title: "Personal"');
  });

  it("resolves tabs (including legacy deep links) through the shared resolver", () => {
    expect(source).toContain("resolveSettingsTab");
    expect(source).toContain("isBoardScopedTab");
  });

  it("renders sidebar with Back to board link and compact project identity", () => {
    expect(source).toContain("Back to board");
    expect(source).toContain("href={`/project/${projectId}/board`}");
    expect(source).toContain("Project Space");
  });

  it("uses shared settings primitives instead of bespoke banner cards", () => {
    expect(source).toContain("<SettingsSection");
    expect(source).toContain("<SettingsRow");
    expect(settingsFormSource).toContain("<SettingsSection");
    expect(settingsFormSource).toContain("<SettingsRow");
    expect(settingsFormSource).toContain("<SettingsSwitch");
  });

  it("renders a single shared board scope bar for board-level tabs", () => {
    expect(source.match(/<select/g)?.length ?? 0).toBe(1);
    expect(source).toContain("Active Board");
  });

  it("removes static reference guides from the attributes tab", () => {
    expect(source).not.toContain("P0 - Urgent");
    expect(source).not.toContain("Fibonacci Scale");
    expect(source).not.toContain("Standard Card Statuses");
  });

  it("integrates Members management with direct link to project members page", () => {
    expect(source).toContain("Space Members");
    expect(source).toContain("href={`/project/${projectId}/members`}");
    expect(source).toContain("Manage members and invitations");
    expect(source).toContain("Avatar user={member.user}");
  });

  it("preserves SettingsForm, ProjectBoardsManager and SoundToggle integrations", () => {
    expect(source).toContain("<ProjectBoardsManager");
    expect(source).toContain("<SettingsForm");
    expect(source).toContain("<SoundToggle");
    expect(source).toContain("onConfigureBoard={handleOpenBoardConfig}");
  });

  it("integrates interactive BoardAttributesTab, BoardGeneralTab and BoardColumnsTab", () => {
    expect(source).toContain("<BoardAttributesTab");
    expect(source).toContain("boardId={selectedBoardId}");
    expect(source).toContain("initialSubTab={attributeSubTab}");
    expect(source).toContain("onPrioritiesChange={handlePrioritiesChange}");
    expect(source).toContain("<BoardGeneralTab");
    expect(source).toContain("<BoardColumnsTab");
  });

  it("guards destructive board deletion with ConfirmModal", () => {
    expect(source).toContain("<ConfirmModal");
    expect(source).toContain("setDeleteConfirmOpen(true)");
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
