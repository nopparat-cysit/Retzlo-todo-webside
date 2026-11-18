import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("FAB display red star persistence", () => {
  it("keeps diary FAB display pinned when clicking the active red star again", () => {
    const source = readFileSync(new URL("./diary-hub-panel.tsx", import.meta.url), "utf8");
    const toggleBody = source.match(/function toggleRedStar\(item: HubDiaryItem\) \{([\s\S]*?)\n  \}/)?.[1] ?? "";

    expect(toggleBody).toContain("setRedStarIdState(item.id)");
    expect(toggleBody).toContain('setRedStarItem({ type: "diary"');
    expect(toggleBody).not.toContain("setRedStarItem(null)");
    expect(source).toContain('"Pinned to FAB"');
    expect(source).not.toContain('"Unpin from FAB"');
  });

  it("keeps note FAB display pinned when clicking the active red star again", () => {
    const source = readFileSync(new URL("./notes-hub-panel.tsx", import.meta.url), "utf8");
    const toggleBody = source.match(/function toggleRedStar\(note: HubNote\) \{([\s\S]*?)\n  \}/)?.[1] ?? "";

    expect(toggleBody).toContain("setRedStarIdState(note.id)");
    expect(toggleBody).toContain('setRedStarItem({ type: "note"');
    expect(toggleBody).not.toContain("setRedStarItem(null)");
    expect(source).toContain('"Pinned to FAB"');
    expect(source).not.toContain('"Unpin from FAB"');
    expect(source).not.toContain('"/hub/notes"');
  });

  it("avoids dead /hub/diary routes and confirms diary deletion via ConfirmModal", () => {
    const diarySource = readFileSync(new URL("./diary-hub-panel.tsx", import.meta.url), "utf8");
    expect(diarySource).not.toContain('"/hub/diary"');
    expect(diarySource).toContain("showConfirmDelete");
    expect(diarySource).toMatch(/<ConfirmModal[\s\S]*open=\{showConfirmDelete\}[\s\S]*layer="above-modal"[\s\S]*variant="danger"/);
  });
});
