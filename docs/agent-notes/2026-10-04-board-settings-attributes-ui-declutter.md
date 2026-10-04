# Work Note: 2026-10-04 — Board Settings Attributes UX/UI Declutter & Spacious Layout

## Objective
Address user feedback regarding the cramped/suffocating visual presentation ("มันดู อึดอัด เลยขอบต่างๆ") in the Board Settings modal under the "คุณสมบัติการ์ด" (Card Attributes) section. Remove heavy nested border boxes (the Russian nesting doll effect), streamline sub-navigation, compact story point presets into horizontal chips, and unify status, priority, and story point lists into single clean containers with subtle dividers.

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/components/kanban/board-settings-modal.tsx`: Widened modal max-width from `max-w-2xl` (672px) to `max-w-3xl` (768px), softened `TabsList` background and borders to eliminate visual clutter.
  - `src/components/kanban/board-attributes-tab.tsx`:
    - Refactored sub-navigation pills from a boxed container (`rounded-xl border bg-stone-100/90`) to an airy, borderless sub-tab row with subtle bottom divider.
    - Replaced heavy banner cards in Status and Story Points with clean typography headers and accessible action buttons.
    - Converted the bulky 4-card Story Point presets grid into a sleek single-line horizontal chip selector, saving ~120px of vertical space.
    - Streamlined the "Add Status" and "Add Custom Story Point" sections into sleek inline bars.
    - Replaced individual floating item card boxes with unified list containers featuring subtle `divide-y` dividers and generous row padding.
  - `src/components/kanban/board-priorities-tab.tsx`:
    - Replaced the heavy boxed banner card with a clean header row and counter pill.
    - Unified the priority levels list into a single rounded container with `divide-y` dividers.
    - Streamlined the live preview section at the bottom.
  - `docs/theme-system.md`: Updated theme documentation and changelog.

## Important Behavior Changes
1. **Clean Airy Layout:** Eliminated multi-level nested card boxes inside the modal dialog. The UI now feels spacious, breathable, and aligned with modern design patterns (Linear / Notion).
2. **Compact Presets Chips:** Story Point scale templates (Retzlo Standard, Fibonacci Scrum, T-Shirt Sizing, Linear Scale) can now be applied with one click from compact chip buttons without pushing the content below the fold.
3. **Unified Divided Lists:** Statuses, Priority levels, and Story Points are grouped inside single unified bordered containers with clean dividers between rows instead of individual floating card blocks with stacked borders.
4. **Preserved Integrity:** All functionality, confirmation modals (`ConfirmModal`), toast notifications (`useToast`), and cross-component custom events (`retzlo:statuses-updated`, `retzlo:story-points-updated`) remain completely intact.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/board-settings-attributes.test.ts`: Passed (7/7 tests).
- `npx vitest run src/components/kanban/`: Passed (10/10 test files, 56/56 tests).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (Next.js production build succeeded).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
