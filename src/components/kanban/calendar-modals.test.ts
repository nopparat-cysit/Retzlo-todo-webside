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

  it("integrates getPriorityMeta for unified priority sorting and badge styling", () => {
    expect(calendarSource).toContain('import { getPriorityMeta } from "@/lib/kanban/priority"');
    expect(calendarSource).toContain("getPriorityRank");
    expect(calendarSource).toContain("meta.pillClass");
    expect(calendarSource).not.toContain('priority === "HIGH"');
  });

  it("declares selectedDayItems before selectedDayHeader to prevent TDZ runtime crash", () => {
    const selectedDayItemsIndex = calendarSource.indexOf("const selectedDayItems = useMemo");
    const selectedDayHeaderIndex = calendarSource.indexOf("const selectedDayHeader = useMemo");
    expect(selectedDayItemsIndex).toBeGreaterThan(-1);
    expect(selectedDayHeaderIndex).toBeGreaterThan(-1);
    expect(selectedDayItemsIndex).toBeLessThan(selectedDayHeaderIndex);
  });

  it("initializes live sync after calendar filter and dialog state declarations", () => {
    const useLiveSyncIndex = calendarSource.indexOf("useLiveSync({");
    const useStateIndex = calendarSource.indexOf("const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState");
    expect(useLiveSyncIndex).toBeGreaterThan(-1);
    expect(useStateIndex).toBeGreaterThan(-1);
    expect(useLiveSyncIndex).toBeGreaterThan(useStateIndex);
  });
});
