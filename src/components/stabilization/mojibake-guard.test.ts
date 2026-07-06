import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const checkedFiles = [
  new URL("../kanban/card-modal.tsx", import.meta.url),
  new URL("../kanban/board.tsx", import.meta.url),
  new URL("../notes/board-notes-rail.tsx", import.meta.url),
  new URL("../notes/notes-panel.tsx", import.meta.url),
  new URL("../hub/diary-hub-panel.tsx", import.meta.url),
  new URL("../hub/fab-hub.tsx", import.meta.url)
];

describe("user-visible copy encoding", () => {
  it("does not contain common mojibake fragments in touched feature surfaces", () => {
    for (const file of checkedFiles) {
      const source = readFileSync(file, "utf8");

      expect(source, file.pathname).not.toMatch(/ðŸ|à¸|âœ|â†|Â·|Ã¢/);
    }
  });
});
