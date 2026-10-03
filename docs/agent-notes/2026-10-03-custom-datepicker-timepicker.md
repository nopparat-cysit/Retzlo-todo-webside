# 2026-10-03 — Custom DatePicker & TimePicker Global Components

## Objective
Design and implement custom global `DatePicker`, `TimePicker`, and `DateTimePicker` components perfectly tailored to our Retro Lofi Indigo design system, replacing browser native inputs (`type="date"`, `type="time"`) across the platform.

## Files Created / Modified
- `src/components/ui/date-picker.tsx` (created): Global DatePicker component featuring:
  - Retro lofi calendar view with month and year navigation
  - Thai and English month/weekday headers
  - Selected date pills (`bg-dusk-lavender text-stone-950 font-bold`)
  - Today ring/indicator with amber accent
  - Quick shortcuts: วันนี้ (Today), พรุ่งนี้ (Tomorrow), สัปดาห์หน้า (Next week), ล้าง (Clear)
  - Accessible trigger button with calendar icon, clear `X` button, and Radix popover.
- `src/components/ui/time-picker.tsx` (created): Global TimePicker component featuring:
  - Retro digital clock display (`[ HH ] : [ mm ] น.`)
  - Steppers / scrollable lists for Hours (00-23) and Minutes (00-55 in 5-min increments)
  - Quick preset time pills: 09:00 เช้า, 12:00 เที่ยง, 13:30 บ่าย, 17:00 เลิกงาน, 20:00 ค่ำ, ตลอดวัน
  - Radix popover trigger with clock icon and clear button.
- `src/components/ui/date-time-picker.tsx` (created): Combined global DateTimePicker component featuring a tab switcher between Date and Time in a unified popover.
- `src/components/ui/date-time-field.tsx` (modified): Upgraded `DateTimeField` to use our custom `DatePicker` and `TimePicker` instead of native browser inputs, automatically upgrading `CardModal`, `NotesPanel`, etc.
- `src/components/kanban/board-list-view.tsx` (modified): Upgraded Start Date and Due Date cells in the Spreadsheet Table View to open the custom retro calendar popover.
- `src/app/design-system/design-system-preview.tsx` (modified): Added showcases for `DatePicker`, `TimePicker`, and `DateTimeField`.
- `src/components/ui/date-picker.test.ts` (created): Comprehensive unit test suite covering date parsing, ISO formatting, display formatting, time parsing, and component implementation contracts.

## Important Behavior Changes
- No more unstyled native browser calendar and clock popups.
- All date and time selection across the platform now uses our Retro Lofi Indigo design language with full dark/light mode compatibility.
- Fully accessible keyboard navigation and click-outside dismissal via Radix Popover portals.

## Verification Run & Results
- `npx tsc --noEmit`: 0 errors.
- `npm run lint`: 0 errors / warnings.
- `npx prisma validate`: Schema valid.
- `npx vitest run`: 77 test files passed, 387 tests passed (100% pass).
- `npm run build`: Production build verified.
