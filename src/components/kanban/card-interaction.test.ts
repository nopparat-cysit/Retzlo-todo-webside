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
});