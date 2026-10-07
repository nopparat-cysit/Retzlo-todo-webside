# Work Session Note: Board Settings Modal UX Redesign & Trademark / Competitor Brand Cleanup

**Date:** 2026-10-07  
**Objective:** Redesign the Board Settings Modal (`BoardSettingsModal`), template picker (`BoardTemplatePicker`), and attribute template bars to eliminate viewport overflow, oversized dialog heights, ragged line-wrapping, and empty grid gaps ("ใหญ่เกิน ดันกันจนเลยขอบ", "มี space ช่องว่าง"). Completely remove all competitor / trademark brand names (such as "Jira style", "Linear", "Trello") from the codebase, UI labels, and documentation to prevent legal / trademark liabilities ("ห้ามเอามาโดยเด็ดขาด หาส่วนอื่นๆด้วยมีอีกไหม เดี๋ยวโดนฟ้อง").

---

## 1. Files Created, Modified, or Moved

### Modified
- `src/components/kanban/board-settings-modal.tsx`:
  - Enforced a bounded dialog shell: `h-[88vh] sm:h-[82vh] max-h-[720px] min-h-[500px]` with fixed pinned header, internal independent scrolling content pane (`flex-1 min-h-0 overflow-y-auto scrollbar-soft`), and pinned bottom action footer (`Save` and `Cancel` buttons always visible).
  - Replaced "เปิดหน้าเต็มจอ (Jira Style)" with "เปิดหน้าเต็มจอ (Full View)".
  - Replaced Jira comment references with neutral Master-Detail terminology.
- `src/components/kanban/board-template-picker.tsx`:
  - Replaced the awkward 3-column grid (`lg:grid-cols-3` which left slot 6 empty for 5 templates) with a balanced responsive 5-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2`) where item 5 cleanly spans 2 columns on `sm:` (`sm:col-span-2 lg:col-span-1`).
  - Redesigned the pipeline preview to a connected workflow stepper (`flex items-center gap-1.5 overflow-x-auto scrollbar-soft`) with subtle `ChevronRight` flow arrows and equal stretch columns (`flex-1 min-w-[110px]`).
- `src/components/kanban/board-attributes-tab.tsx`:
  - Converted the wrapped status and story point template bars from ragged wrapping (`flex-wrap`) to clean, sleek horizontal scrollable pill bars (`flex items-center gap-1.5 overflow-x-auto scrollbar-soft pb-1.5 pt-0.5`).
- `src/components/kanban/board-priorities-tab.tsx`:
  - Converted priority template pills from ragged wrap to smooth scrollable pill bar with `shrink-0`.
- `src/lib/kanban/priority.ts`:
  - Renamed user-facing template name: `"P0 - P4 Scale (Jira Standard)"` -> `"P0 - P4 Scale (Severity Standard)"`. Preserved internal ID `jira_p0_p4` for database and backward compatibility.
- `src/components/kanban/board.tsx`:
  - Removed Jira comment reference.
- `src/components/help/help-center-client.tsx`:
  - Replaced "Jira P0-P4 Scale" with "P0-P4 Severity Scale".
  - Replaced "แบบเดียวกับ Linear / GitHub" with "แบบมาตรฐานแบ่งสัดส่วนชัดเจน".
  - Replaced "Scope-grouped Settings Row (Linear/GitHub style)" with "Scope-grouped Settings Row (Modern Minimalist Standard)".
- `src/components/settings/settings-section.tsx`:
  - Removed Linear/GitHub mentions from documentation comments.
- `src/components/kanban/board-views-and-sidebar.test.ts`:
  - Renamed test case from "provides Jira-style table columns..." to "provides structured table columns...".
- `docs/system-guide.md`:
  - Replaced "Jira P0–P4 Scale" with "P0–P4 Severity Scale".
  - Replaced "หน้าต่างตั้งค่าบอร์ดสไตล์ Jira (Jira Master-Detail Board Settings)" with "หน้าต่างตั้งค่าบอร์ดแบบรวมศูนย์ (Master-Detail Board Settings)".
  - Replaced "เปิดหน้าเต็มจอ (Jira Style)" with "เปิดหน้าเต็มจอ (Full View)".
  - Replaced "Stripe/Linear Inspired" with "Modern SaaS Hub".
- `docs/theme-system.md`:
  - Removed competitor brand references from log headers and entries.
- `src/components/kanban/board-sidebar-dropdown.tsx`:
  - Added tactile hover slide interaction to the Boards accordion header: in unhovered state on desktop, only the original `ChevronDown` accordion button is visible at the right edge. On hover, `ChevronDown` smoothly slides to the left (`md:group-hover/header:-translate-x-7`), inserting and revealing the `Plus` ("Create new board") button at the right edge. When hover leaves, the `Plus` button fades out and `ChevronDown` slides smoothly back to its original position at `right-0`.
- `docs/design.md`, `SKILL.md`, `PRODUCT.md`:
  - Removed historical competitor mentions (Trello / Jira).

---

## 2. Key Behavior & UX Changes

1. **Fixed Bounded Dialog Layout for Board Settings**:
   - Previously: `BoardSettingsModal` had no maximum height constraint. Any tab with multiple statuses or columns expanded the modal vertically past the top and bottom of the browser viewport, hiding the Save button and pushing elements off-screen.
   - Now: The modal is constrained to `h-[88vh] sm:h-[82vh] max-h-[720px] min-h-[500px]` with `max-w-4xl lg:max-w-5xl`. The header and footer are pinned, and the right content area scrolls smoothly with `scrollbar-soft`.
2. **Balanced Template Picker Grid & Pipeline Flow**:
   - Previously: 5 templates rendered in `lg:grid-cols-3`, leaving an empty hole in slot 6.
   - Now: All 5 templates sit in a single row on desktop (`lg:grid-cols-5`), or a balanced 2-column layout on tablet where template 5 spans full width across both columns (`sm:col-span-2 lg:col-span-1`).
   - The preview pipeline now dynamically stretches with chevron flow indicators.
3. **Scrollable Template Pill Bars in Attributes & Priorities**:
   - Ragged multiline wrapping with dead whitespace has been replaced with compact, horizontally scrollable pill bars.
4. **Complete Trademark & Brand Elimination**:
   - Zero user-facing or documentation references to Jira, Linear, Trello, or other proprietary platforms remain.
5. **Sidebar Boards Accordion Hover Slide & Insert Interaction**:
   - In unhovered state, only the primary chevron arrow is visible at the right edge, keeping the sidebar minimalist and decluttered.
   - On hover, the chevron smoothly slides to the left by 28px (`transition-all duration-200 ease-out`), revealing the `+` (Create new board) button on the right edge.
   - On mouse leave, the `+` button fades away and the chevron smoothly slides back to its original position at the right edge.

---

## 3. Database & Schema Changes
- None. Database schema and migrations remain untouched.

---

## 4. Verification & Results

- **Vitest**: `npx vitest run`
  - 90 test files passed (90/90 passed, 470 passed, 3 skipped).
- **ESLint**: `npm run lint`
  - Passed: `✔ No ESLint warnings or errors`.
- **Prisma Validate**: `npx prisma validate`
  - Passed: `The schema at prisma\schema.prisma is valid 🚀`.
- **Next.js Production Build**: `npm run build`
  - Passed: `✓ Compiled successfully`, all 38 static & dynamic pages generated with 0 errors.

---

## 5. Follow-ups
- Ensure future feature additions avoid referencing proprietary third-party tool names in UI labels or user-facing documentation.
