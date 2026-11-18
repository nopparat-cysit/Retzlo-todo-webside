import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const calendarSource = readFileSync(new URL("./project-calendar.tsx", import.meta.url), "utf8");

describe("calendar modal layering", () => {
  it("uses AppModal for calendar note and day detail overlays and ModalPortal at z-[900] for mobile upcoming drawer", () => {
    expect(calendarSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(calendarSource).toContain('import { ModalPortal } from "@/components/ui/modal-portal"');
    expect(calendarSource).toMatch(/<ModalPortal>[\s\S]*z-\[900\][\s\S]*<\/ModalPortal>/);
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

  it("synchronizes selectedDayKey on task click and preserves selection when day modal is closed", () => {
    expect(calendarSource).toContain("setSelectedDayKey(key);\n                                    setSelectedCardId(entry.id);");
    expect(calendarSource).toContain("setSelectedDayKey(key);\n                                    setSelectedNoteId(entry.id);");
    expect(calendarSource).toContain("setSelectedDayKey(dateKey);\n    setQuickAddDate(dateKey);");
    expect(calendarSource).not.toContain("onClick={() => setSelectedDayKey(null)}");
  });

  it("uses inset ring for selected day and omits cramped add button from calendar month cells", () => {
    expect(calendarSource).toContain('isSelectedDay && "ring-2 ring-inset ring-indigo-500');
    expect(calendarSource).not.toContain('title={`Add task for ${key}`}');
  });

  it("caps filter popover width on narrow screens and guards diary deletion with ConfirmModal", () => {
    expect(calendarSource).toContain("max-w-[calc(100vw-1.5rem)]");
    expect(calendarSource).toContain("deletingDiaryTarget");
    expect(calendarSource).toMatch(/<ConfirmModal[\s\S]*open=\{Boolean\(deletingDiaryTarget\)\}[\s\S]*variant="danger"/);
  });
});
