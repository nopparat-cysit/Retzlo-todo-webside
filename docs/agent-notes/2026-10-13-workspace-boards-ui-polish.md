# Workspace Boards UI/UX Polish, List View & Column Resize Improvements

- **Date:** 2026-10-13
- **Objective:** Eliminate visual redundancy in Workspace Boards Hub, elevate board card aesthetics, introduce interactive Grid / List view toggle, and fix Kanban column resize handle positioning, aesthetics, and hover tooltips.

## Changes Made

### Files Modified
- `src/components/project/projects-dashboard.tsx`:
  - **Eliminated Header Redundancy:** Removed duplicate `Launch Board` link from sub-navigation tabs and duplicate `+ New Board` button from top command bar.
  - **Integrated Health Metrics:** Added compact Workspace Progress Pill (`Tasks`, `Done`, and animated gradient progress bar with percentage) directly into the top command bar alongside a single primary `Launch Board →` CTA.
  - **Removed Bloated Hero Banner:** Eliminated redundant Workspace Hero Card that repeated the title, sticker, and duplicate launch button, freeing up over 120px of vertical viewport.
  - **Streamlined Boards Toolbar:** Refined the heading to `Workspace Boards`, added a view toggle switcher (`LayoutGrid` vs `List`), with search input and `+ New Board` button.
  - **Card Aesthetic Overhaul (`WorkspaceBoardCard`):**
    - Replaced the bulky full-width bottom button with a sleek interactive footer showing pipeline state and a responsive `Open Board →` action with hover arrow slide.
    - Added color-coded column status chips (neutral for Backlog, amber for In Progress, teal for Done).
    - Elevated typography, squircle icon gradients, and subtle border glow on hover.
  - **List View Implementation (`WorkspaceBoardRow` & `QuickCreateBoardBlueprintRow`):**
    - Implemented high-density horizontal row rendering for all workspace boards.
    - Shows squircle icon, title, visibility badge, column and task counts, task progress bar, column pill previews, quick `Open Board` action, and 3-dots dropdown menu.
    - Persistent preference via `localStorage.getItem("retzlo-board-view-mode")`.
- `src/components/kanban/column.tsx`:
  - **Flush Edge Alignment ("ติดขอบสวยๆ"):** Separated the inner `overflow-hidden` container from the outer column `<section>`, centering the vertical guide line at `x = 0` flush on the column's right border, eliminating the awkward inner gap.
  - **Floating Elevated Grab Handle ("ตัวลากไม่จม"):** Replaced the dark sunken pill with an elevated tactile capsule (`h-9 w-4`) featuring high-contrast borders, ambient shadow glow, and a `GripVertical` icon.
  - **Hover Tooltip Guidance:** Added an informative floating tooltip when hovering without dragging, explaining:
    - Current width and drag action: `↔ ปรับขนาดคอลัมน์ ({columnWidth}px)`
    - Drag interaction: `คลิกค้างแล้วลากซ้าย-ขวาเพื่อขยาย/ย่อ`
    - Double-click reset hint: `ดับเบิลคลิกเพื่อคืนค่าเริ่มต้น (335px)`
  - Seamlessly switches to the live width badge (`{columnWidth}px`) during active dragging.

## Verification
- `npm run lint`: 0 warnings, 0 errors.
- `npx vitest run src/components/kanban/column-resize.test.ts`: Passed (2/2 tests).
- `npx vitest run`: 98 test suites passed, 518 tests passed, 3 skipped, 0 failed.
- `npx prisma validate`: Schema is valid.
