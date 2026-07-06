import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const cardModalSource = readFileSync(new URL("./card-modal.tsx", import.meta.url), "utf8");
const boardSource = readFileSync(new URL("./board.tsx", import.meta.url), "utf8");
const appModalSource = readFileSync(new URL("../ui/app-modal.tsx", import.meta.url), "utf8");

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
});
