import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const cardModalSource = readFileSync(new URL("./card-modal.tsx", import.meta.url), "utf8");
const boardSource = readFileSync(new URL("./board.tsx", import.meta.url), "utf8");
const columnSource = readFileSync(new URL("./column.tsx", import.meta.url), "utf8");
const appModalSource = readFileSync(new URL("../ui/app-modal.tsx", import.meta.url), "utf8");
const reorderRouteSource = readFileSync(new URL("../../app/api/cards/reorder/route.ts", import.meta.url), "utf8");

describe("kanban card interactions", () => {
  it("isolates modal events from the sortable card click handler", () => {
    expect(cardModalSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(cardModalSource).toContain("<AppModal");
    expect(appModalSource).toMatch(/function handleOverlayPointerDown[\s\S]*event\.stopPropagation\(\)/);
    expect(appModalSource).toMatch(/function handleOverlayClick[\s\S]*event\.stopPropagation\(\)/);
    expect(appModalSource).toMatch(/function stopModalContentEvent[\s\S]*event\.stopPropagation\(\)/);
    expect(appModalSource).toMatch(/function handleModalContentKeyDown[\s\S]*event\.stopPropagation\(\)/);
    expect(appModalSource).toMatch(/event\.key === "Escape"[\s\S]*requestClose\(\)/);
  });

  it("keeps board card dragging responsive from short pointer movement", () => {
    expect(boardSource).toContain("activationConstraint: { distance: 4 }");
  });

  it("does not leave unsynced optimistic drag-over state when drag end loses the target", () => {
    expect(boardSource).toContain("lastCardDropTargetRef");
    expect(boardSource).toContain("lastCardDropTargetRef.current = target");
    expect(boardSource).toMatch(/const target = getCardDropTarget\(event, previous\) \?\? lastCardDropTargetRef\.current/);
    expect(boardSource).toMatch(/if \(!target\)[\s\S]*setColumns\(previous\)/);
  });

  it("uses explicit column default statuses instead of done-column name or position guesses", () => {
    expect(boardSource).toContain("defaultCardStatus");
    expect(columnSource).toContain("defaultCardStatus");
    expect(reorderRouteSource).toContain("defaultCardStatus");
    expect(boardSource).not.toContain("isLastColumn");
    expect(reorderRouteSource).not.toContain("isLastCol");
    expect(reorderRouteSource).not.toContain("toLowerCase().includes(\"done\")");
  });

  it("quick-add cards inherit the column default status", () => {
    expect(columnSource).toContain("status: column.defaultCardStatus");
    expect(columnSource).not.toContain('status: "TODO"');
  });

  it("does not nest CardModal or ConfirmModal inside article onClick to prevent event bubbling re-opening", () => {
    const cardSource = readFileSync(new URL("./card.tsx", import.meta.url), "utf8");
    expect(cardSource).toMatch(/<\/article>\s*<CardModal/);
    expect(cardSource).toMatch(/\/>\s*<ConfirmModal/);
  });

  it("renders accessible Radix UI select and avatar badges for assignee filtering without raw HTML select", () => {
    expect(boardSource).toContain("<Select value={assigneeFilter}");
    expect(boardSource).toContain("<SelectTrigger");
    expect(boardSource).toContain("<AssigneeAvatar");
    expect(boardSource).not.toContain("<select");
    expect(boardSource).not.toContain("border-primary-400");
  });

  it("provides consolidated filter clear button and empty board onboarding", () => {
    expect(boardSource).toContain("activeFilterCount");
    expect(boardSource).toContain("resetAllFilters");
    expect(boardSource).toContain("Clear filters");
    expect(boardSource).toContain("No columns on this board yet");
    expect(boardSource).toContain("hasActiveFilters={activeFilterCount > 0}");
    expect(columnSource).toContain("No cards match filter");
  });

  it("does not trigger false unsaved changes alerts when opening and immediately closing pristine modals", () => {
    // CardModal must compare status against initial card status (column default), not hardcoded 'TODO'
    expect(cardModalSource).not.toContain('selectedStatus !== "TODO"');
    expect(cardModalSource).toMatch(/selectedStatus !== initialStatus/);
    expect(cardModalSource).toMatch(/initialStatus = card\?\.status \?\? "TODO"/);

    // Board must cleanly reset all fields before opening column modal
    expect(boardSource).toContain("openCreateColumnModal");
    expect(boardSource).toMatch(/onClick=\{openCreateColumnModal\}/);

    // Column settings must cleanly reset state upon opening
    expect(columnSource).toMatch(/setSettingsName\(column\.name\)[\s\S]*setIsSettingsOpen\(true\)/);
  });

  it("preserves card assignees, difficulty, and dates when column settings update and prevents timezone date shift", () => {
    // board.tsx must not overwrite existing column cards with un-serialized server cards
    expect(boardSource).toMatch(/cards:\s*col\.cards/);

    // board.tsx normalizeCard must fallback to privateCoins for assignees, difficulty, and startDate
    expect(boardSource).toContain("extractAssigneeIds(privateCoins)");
    expect(boardSource).toContain("extractDifficulty(privateCoins)");
    expect(boardSource).toContain("extractStartDate(privateCoins)");

    // card-modal.tsx must use formatLocalDate to avoid UTC timezone date shift
    expect(cardModalSource).toContain("function formatLocalDate");
    expect(cardModalSource).toContain("formatLocalDate(card?.dueDate");
    expect(cardModalSource).toContain("formatLocalDate(card?.startDate");
  });
});