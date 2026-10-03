# Work Note: Display Priority by Direct Name in Spreadsheet Table View

**Date:** 2026-10-03
**Objective:** Display task priority by its direct name (`High`, `Medium`, `Low`) with directional indicator icons (`ArrowUp`, `ArrowRight`, `ArrowDown`) in the Spreadsheet Table View and Grouped View, widening the priority cell to `w-32` and updating helper text to `Default Medium`.

---

## 1. Files Modified

- `src/components/kanban/board-list-view.tsx`:
  - Widened the Priority header column from `w-28` to `w-32`.
  - Updated Table View Priority button from rendering code `P0`/`P1`/`P2` to rendering directional icons + short names: `High`, `Medium`, `Low`.
  - Updated Table View Priority dropdown items to show icons with English labels (`High (Urgent)`, `Medium`, `Low`).
  - Updated Quick-Add row helper text from `Default P1` to `Default Medium` and cell width to `w-32`.
  - Upgraded Grouped Accordion View to render the same interactive Priority pill dropdown with direct name (`High`, `Medium`, `Low`) and directional icons, matching `w-32`.
- `docs/system-guide.md`:
  - Updated Section 2.3 (Spreadsheet Table View) documenting direct Priority name indicators and interactive selector.
- `src/components/help/help-center-client.tsx`:
  - Updated Knowledge Base highlight with Priority direct name and selector details.

---

## 2. Important Behavior Changes

1. **Direct Priority Names:** Users now see clean, readable priority names (`High`, `Medium`, `Low`) with directional arrow icons instead of abstract codes (`P0`, `P1`, `P2`).
2. **Unified Interactive Dropdown:** In both Table View and Grouped Accordion View, users can click the Priority badge to open a clean dropdown and change priority with immediate feedback.
3. **Consistent Spacing:** Priority column widened to `w-32` (128px) to provide comfortable breathing room for both label text and arrow icons.

---

## 3. Database / Schema Changes

- None. Uses existing `CardPriority` enum (`HIGH`, `MEDIUM`, `LOW`).

---

## 4. Verification Commands & Results

- `npx vitest run src/components/kanban/board-views-and-sidebar.test.ts`: **Passed** (6/6 tests passed).
- `npx tsc --noEmit`: **Passed** (0 errors).
- `npm run lint`: **Passed** (✔ No ESLint warnings or errors).
- `npx prisma validate`: **Passed** (The schema at prisma\schema.prisma is valid 🚀).
- `npm run build`: **Passed** (Optimized production build generated 36/36 static/dynamic routes successfully).

---

## 5. Known Follow-ups, Blockers, or Deployment Notes

- None. Ready for commit and push.
