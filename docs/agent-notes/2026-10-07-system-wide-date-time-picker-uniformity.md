# Work Note: System-wide Date & Time Picker Uniformity

- **Date**: 2026-10-07
- **Objective**: Analyze and unify all Date Picker and Time Picker components across the entire system into a single cohesive Retro Lofi design, eliminating disparate OS-native inputs (`type="date"`, `type="time"`).

## System-wide Analysis of Date & Time Pickers

### 1. Existing Custom Picker Locations (Already using unified components)
- `src/components/board/card-modal.tsx`: Kanban card due date/time modal picker.
- `src/components/board/board-list-view.tsx`: Table row inline due date picker.
- `src/components/board/notes-panel.tsx`: Note due date/time picker.
- `src/components/board/board-notes-rail.tsx`: Quick note sidebar due date/time picker.
- `src/components/design-system-preview.tsx`: Design system showcase for DatePicker and TimePicker.
- `src/components/ui/date-time-field.tsx`: Combined date-time composite component.

### 2. Disparate / Native Input Locations Found & Migrated
- `src/components/diary/diary-checklist.tsx`: Native `type="date"` (Start Date) and `type="time"` (Due Time) in checklist task modal.
- `src/components/diary/diary-list-panel.tsx`: Native `type="date"` in Diary entry creation/edit modal.
- `src/components/diary/diary-todo.tsx`: Native `type="date"` in daily task date filter ("Pick day").
- `src/components/hub/diary-hub-panel.tsx`: Native `type="date"` in quick diary creation drawer.
- `src/components/hub/fab-hub.tsx`: Native `type="date"` and `type="time"` in floating action button (FAB) creation modal for Tasks, Notes, and Diaries.
- `src/components/project/project-quick-hub.tsx`: Native `type="date"` in project quick hub modal.

## Files Modified
- `src/components/ui/date-picker.tsx`: Added optional `name` and `required` props with hidden input for HTML forms; added bilingual localized default placeholder (`useLanguage()`).
- `src/components/ui/time-picker.tsx`: Added optional `name` and `required` props with hidden input for HTML forms; added bilingual localized default placeholder (`useLanguage()`).
- `src/components/ui/date-time-picker.tsx`: Integrated `useLanguage()` for bilingual placeholders.
- `src/components/diary/diary-checklist.tsx`: Replaced native `type="date"` and `type="time"` with `DatePicker` and `TimePicker`.
- `src/components/diary/diary-list-panel.tsx`: Replaced native `type="date"` with `DatePicker`.
- `src/components/diary/diary-todo.tsx`: Replaced native `type="date"` with `DatePicker`.
- `src/components/hub/diary-hub-panel.tsx`: Replaced native `type="date"` with `DatePicker`.
- `src/components/hub/fab-hub.tsx`: Replaced native `type="date"` and `type="time"` with `DatePicker` and `TimePicker`.
- `src/components/project/project-quick-hub.tsx`: Replaced native `type="date"` with `DatePicker`.
- `src/components/ui/date-picker.test.ts`: Added tests verifying zero native date/time inputs remain and that hidden input form attributes function properly.
- `docs/theme-system.md`: Documented theme coverage update for date/time pickers.

## Behavior Changes
- Zero disparate OS/browser-native date/time inputs remain in the user-facing codebase.
- All date and time selections now use the unified Retro Lofi indigo popover UI, with keyboard accessibility, custom year/month navigation, preset time chips, and light/dark theme synchronization.
- Seamless compatibility with standard HTML forms via hidden inputs (`name`, `required`).
- Auto-localized placeholders in Thai and English based on the active language context.

## Verification
- `npm test`: Passed (90/90 test files, 472 passed tests).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Schema is valid.
- `npm run build`: Compiled successfully (38/38 routes).
