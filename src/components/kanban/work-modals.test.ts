import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const cardModalSource = readFileSync(new URL("./card-modal.tsx", import.meta.url), "utf8");
const boardSource = readFileSync(new URL("./board.tsx", import.meta.url), "utf8");
const columnSource = readFileSync(new URL("./column.tsx", import.meta.url), "utf8");

describe("Work module modal migration", () => {
  it("uses AppModal for card details so modal clicks cannot reach the board", () => {
    expect(cardModalSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(cardModalSource).not.toContain("createPortal");
    expect(cardModalSource).toContain("<AppModal");
  });

  it("uses AppModal for board column creation with 2-column layout and live preview", () => {
    expect(boardSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(boardSource).toMatch(/<AppModal[\s\S]*Create column/);
    expect(boardSource).toContain("max-w-4xl");
    expect(boardSource).toContain("grid-cols-1 md:grid-cols-12");
    expect(boardSource).toContain("<BoardMockupPreview");
  });

  it("uses AppModal for column settings with 2-column layout and live preview", () => {
    expect(columnSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(columnSource).toMatch(/<AppModal[\s\S]*Edit column/);
    expect(columnSource).toContain("max-w-4xl");
    expect(columnSource).toContain("grid-cols-1 md:grid-cols-12");
    expect(columnSource).toContain("<BoardMockupPreview");
  });
});
