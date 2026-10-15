import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  DEFAULT_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  MAX_COLUMN_WIDTH
} from "./column";

describe("Kanban Column Resizing on X-axis", () => {
  it("defines appropriate limits and default width constants", () => {
    expect(DEFAULT_COLUMN_WIDTH).toBe(335);
    expect(MIN_COLUMN_WIDTH).toBe(260);
    expect(MAX_COLUMN_WIDTH).toBe(600);
    expect(MIN_COLUMN_WIDTH).toBeLessThan(DEFAULT_COLUMN_WIDTH);
    expect(DEFAULT_COLUMN_WIDTH).toBeLessThan(MAX_COLUMN_WIDTH);
  });

  it("implements pointer drag resize handle on X-axis with clamp limits and localStorage persistence", () => {
    const columnSource = readFileSync(new URL("./column.tsx", import.meta.url), "utf8");

    // Must clamp to MIN_COLUMN_WIDTH and MAX_COLUMN_WIDTH
    expect(columnSource).toContain("MIN_COLUMN_WIDTH");
    expect(columnSource).toContain("MAX_COLUMN_WIDTH");
    expect(columnSource).toContain("DEFAULT_COLUMN_WIDTH");

    // Must have resize handler and event listeners
    expect(columnSource).toContain("handleResizeStart");
    expect(columnSource).toContain("pointermove");
    expect(columnSource).toContain("pointerup");

    // Must persist width to localStorage
    expect(columnSource).toContain("column-width-${column.id}");

    // Must render vertical resize handle with role separator and col-resize cursor
    expect(columnSource).toContain('cursor-col-resize');
    expect(columnSource).toContain('role="separator"');
    expect(columnSource).toContain('aria-orientation="vertical"');

    // Must support double-click to reset width
    expect(columnSource).toContain("onDoubleClick={handleResetWidth}");

    // Must disable transitions while resizing for silky 60fps performance
    expect(columnSource).toContain('isResizing ? "transition-none select-none" : "transition duration-200"');
  });

  it("renders curved vector guide lines that hug rounded-2xl top and bottom corners", () => {
    const columnSource = readFileSync(new URL("./column.tsx", import.meta.url), "utf8");

    // Must define highlight active state on hover or resize
    expect(columnSource).toContain("isHighlightActive = isHandleHovered || isResizing");

    // Must render curved top-right corner arc matching rounded-2xl geometry
    expect(columnSource).toContain('M 0 1 A 15 15 0 0 1 15 16');

    // Must render vertical middle line connecting top and bottom curves
    expect(columnSource).toContain('top-[15px] bottom-[15px] -right-px w-[2px]');

    // Must render curved bottom-right corner arc matching rounded-2xl geometry
    expect(columnSource).toContain('M 15 0 A 15 15 0 0 1 0 15');

    // Must fade out guide line ends smoothly with linearGradient and strokeLinecap="round"
    expect(columnSource).toContain('top-arc-fade');
    expect(columnSource).toContain('bottom-arc-fade');
    expect(columnSource).toContain('strokeLinecap="round"');
    expect(columnSource).toContain('stopOpacity="0"');
    expect(columnSource).toContain('stopOpacity="1"');
  });
});
