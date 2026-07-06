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

  it("uses AppModal for board column creation", () => {
    expect(boardSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(boardSource).toMatch(/<AppModal[\s\S]*Create column/);
  });

  it("uses AppModal for column settings", () => {
    expect(columnSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(columnSource).toMatch(/<AppModal[\s\S]*Edit column/);
  });
});
