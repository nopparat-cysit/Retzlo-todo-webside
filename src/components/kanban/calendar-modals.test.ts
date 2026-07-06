import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const calendarSource = readFileSync(new URL("./project-calendar.tsx", import.meta.url), "utf8");

describe("calendar modal layering", () => {
  it("uses AppModal for calendar note and day detail overlays", () => {
    expect(calendarSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(calendarSource).not.toContain('import { ModalPortal } from "@/components/ui/modal-portal"');
    expect((calendarSource.match(/<AppModal/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(calendarSource).toContain("calendar-note-title");
    expect(calendarSource).toContain("calendar-day-title");
  });
});
