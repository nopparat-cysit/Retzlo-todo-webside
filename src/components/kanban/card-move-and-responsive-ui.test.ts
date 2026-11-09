import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const cardModalSource = readFileSync(new URL("./card-modal.tsx", import.meta.url), "utf8");
const popoverSource = readFileSync(new URL("../ui/popover.tsx", import.meta.url), "utf8");
const datePickerSource = readFileSync(new URL("../ui/date-picker.tsx", import.meta.url), "utf8");
const timePickerSource = readFileSync(new URL("../ui/time-picker.tsx", import.meta.url), "utf8");
const dateTimePickerSource = readFileSync(new URL("../ui/date-time-picker.tsx", import.meta.url), "utf8");
const dateTimeFieldSource = readFileSync(new URL("../ui/date-time-field.tsx", import.meta.url), "utf8");
const cardMoveModalSource = readFileSync(new URL("./card-move-modal.tsx", import.meta.url), "utf8");
const cardSource = readFileSync(new URL("./card.tsx", import.meta.url), "utf8");
const columnSource = readFileSync(new URL("./column.tsx", import.meta.url), "utf8");
const boardSource = readFileSync(new URL("./board.tsx", import.meta.url), "utf8");

describe("Task 1: Card Detail Modal 4 Bottom Buttons Redesign", () => {
  it("implements responsive split layout on desktop and 2-row symmetrical grid on mobile", () => {
    // Desktop split layout
    expect(cardModalSource).toContain("sm:flex-row sm:items-center sm:justify-between");

    // Mobile 2-column grid rows
    expect(cardModalSource).toContain("grid grid-cols-2 gap-2 w-full sm:w-auto");

    // Touch ergonomics: height h-10 on mobile and touch-manipulation
    expect(cardModalSource).toMatch(/h-10 sm:h-9[\s\S]*touch-manipulation/);
  });

  it("ensures CardModalCancelButton accepts optional className prop", () => {
    expect(cardModalSource).toMatch(/function CardModalCancelButton\(\{\s*className\s*\}\s*:\s*\{\s*className\?:\s*string\s*\}\s*=\s*\{\}\)/);
    expect(cardModalSource).toMatch(/<Button[^>]*variant="ghost"[^>]*className=\{className\}/);
  });
});

describe("Task 2: Responsive-Friendly DatePicker, TimePicker, DateTimePicker & Popover", () => {
  it("sets default collisionPadding = 12 on PopoverContent in popover.tsx", () => {
    expect(popoverSource).toContain("collisionPadding = 12");
    expect(popoverSource).toContain("collisionPadding={collisionPadding}");
  });

  it("applies responsive max-width and touch-manipulation to DatePicker", () => {
    expect(datePickerSource).toContain("w-full max-w-[280px] min-w-[260px] select-none p-1 text-xs");
    expect(datePickerSource).toContain("collisionPadding={12}");
    expect(datePickerSource).toContain("max-w-[calc(100vw-1.5rem)]");
    expect(datePickerSource).toContain("aspect-square h-8 max-w-full place-items-center");
    expect(datePickerSource).toContain("select-none touch-manipulation");
    expect(datePickerSource).toContain("touch-manipulation");
  });

  it("applies responsive max-width, touch-manipulation, and 32px touch target to TimePicker", () => {
    expect(timePickerSource).toContain("w-full max-w-[260px] min-w-[240px] select-none p-1 text-xs");
    expect(timePickerSource).toContain("collisionPadding={12}");
    expect(timePickerSource).toContain("max-w-[calc(100vw-1.5rem)]");
    expect(timePickerSource).toContain("h-8 sm:h-7.5 w-full rounded-lg font-mono text-xs font-medium touch-manipulation");
    expect(timePickerSource).toContain("touch-manipulation");
  });

  it("updates DateTimePicker with collisionPadding and comfortable mobile switcher tabs", () => {
    expect(dateTimePickerSource).toContain("collisionPadding={12}");
    expect(dateTimePickerSource).toContain("max-w-[calc(100vw-1.5rem)]");
    expect(dateTimePickerSource).toContain("py-1.5 sm:py-1");
    expect(dateTimePickerSource).toContain("touch-manipulation");
  });

  it("formats DateTimeField shortcut row and buttons for comfortable mobile wrapping", () => {
    expect(dateTimeFieldSource).toContain("flex-wrap gap-1.5");
    expect(dateTimeFieldSource).toContain("h-7.5 sm:h-8 px-2.5 sm:px-3 text-xs");
    expect(dateTimeFieldSource).toContain("touch-manipulation");
  });
});

describe("Task 3: Long-Press Column Move Menu on Kanban Board", () => {
  it("implements CardMoveModal using AppModal and proper column selection contracts", () => {
    expect(cardMoveModalSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(cardMoveModalSource).toContain("export interface CardMoveModalProps");
    expect(cardMoveModalSource).toContain("currentColumnId: string;");
    expect(cardMoveModalSource).toContain("columns: ColumnWithCards[];");
    expect(cardMoveModalSource).toContain("onMove: (card: Card, targetColumnId: string) => Promise<void> | void;");
    expect(cardMoveModalSource).toContain("min-h-[44px] w-full flex items-center justify-between p-2.5 rounded-xl border transition");
    expect(cardMoveModalSource).toContain("ArrowRightLeft");
    expect(cardMoveModalSource).toContain("Current");
  });

  it("implements long-press and right-click trigger in KanbanCard", () => {
    expect(cardSource).toContain("onMoveRequest?: (card: Card, columnId: string) => void");
    expect(cardSource).toContain("longPressTimerRef");
    expect(cardSource).toContain("startPointerPosRef");
    expect(cardSource).toContain("isLongPressTriggeredRef");
    expect(cardSource).toContain("navigator.vibrate?.(40)");
    expect(cardSource).toMatch(/Math\.hypot\(dx,\s*dy\)\s*>\s*8/);
    expect(cardSource).toContain("onContextMenu");
    expect(cardSource).toContain("onPointerDown");
    expect(cardSource).toContain("onPointerMove");
    expect(cardSource).toContain("onPointerUp");
    expect(cardSource).toContain("onPointerCancel");
  });

  it("forwards onMoveCard from KanbanColumn to KanbanCard as onMoveRequest", () => {
    expect(columnSource).toContain("onMoveCard?: (card: Card, columnId: string) => void");
    expect(columnSource).toContain("onMoveRequest={onMoveCard}");
  });

  it("wires card move modal, optimistic update, sound, celebration, and api sync in KanbanBoard", () => {
    expect(boardSource).toContain('import { CardMoveModal } from "@/components/kanban/card-move-modal"');
    expect(boardSource).toContain("const [movingCard, setMovingCard] = useState<{ card: Card; columnId: string } | null>(null);");
    expect(boardSource).toContain("onMoveCard={(card, colId) => setMovingCard({ card, columnId: colId })}");
    expect(boardSource).toContain("handleMoveCardToColumn");
    expect(boardSource).toContain("triggerCelebration");
    expect(boardSource).toContain("playCardDoneSound");
    expect(boardSource).toContain('broadcastChange("CARD_MOVED")');
    expect(boardSource).toContain("<CardMoveModal");
  });
});
