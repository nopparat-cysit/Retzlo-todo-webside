# 2026-09-26: Remove Note Field from Card Modal and Kanban Card

## Objective
Remove the redundant `Note (บันทึกข้อความ)` textarea and section from the Card Details modal and remove the Note badge from the Kanban board card surface, as card discussion, comments, and activity are now fully served by the `Discussion & Activity` comment system (`CardChatTimeline`).

## Files Modified
- `src/components/kanban/card-modal.tsx`:
  - Removed Note textarea UI block (`FileText` icon, title, and Textarea input).
  - Removed `note` state, draft storage serialization, restore logic, and change detection checks.
  - Set `note: null` upon form submission.
  - Removed unused `FileText` import.
- `src/components/kanban/card.tsx`:
  - Removed Note badge from both compact and comfortable card view.
  - Removed unused `FileText` import.

## Verification
- `npx vitest run`: Ran all unit test suites.
- `npm run lint`: ESLint check.
- `npm run build`: Production Next.js build verification.
