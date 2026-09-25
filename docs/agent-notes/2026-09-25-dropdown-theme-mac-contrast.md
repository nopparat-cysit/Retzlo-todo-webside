# 2026-09-25: Mac Dropdown Contrast & Warm Retro Theme Polish

## Objective
Fix washed-out whitish styling ("สีขาวๆ แปลกๆ") and faint disabled-looking button text ("ฟอนต์จางเกินจนเหมือนเป็นฟีลปิด") on toolbar filters (`Today`, `My Tasks`, `All Assignees`, `Filters`, `Upcoming`) and dropdowns on macOS/Light Mode, resolve the inverted `text-stone-700` contrast bug in Light Mode, and align all floating menus (Select, DropdownMenu, Popover, AssigneePicker) with the retro lofi indigo warm paper design direction.

## Files Modified
- `src/app/globals.css`:
  - Corrected Light Mode typography mapping: `.text-stone-600` (`#57534e`), `.text-stone-700` (`#292524`), `.text-stone-800` (`#1c1917`), `.text-stone-900` (`#0c0a09`), eliminating the bug where `text-stone-700` was forced to `#d6d3d1 !important` (faint whitish gray on light backgrounds).
  - Added native `select` appearance normalization (`-webkit-appearance: none; appearance: none;`) to prevent macOS Safari and Chrome from rendering stark white Aqua pills with double-chevrons.
  - Upgraded Light Mode floating menus (`[data-radix-popper-content-wrapper] > div`, `[data-radix-menu-content]`, `[data-radix-select-content]`) to warm paper (`#faf7f2`), subtle warm border (`#e2dcd2`), and soft depth shadows (`0 18px 48px -6px rgba(41,37,36,0.16)`).
  - Added Light Mode item hover and focus states (`#ede7da` with `#0c0a09` text) across all Radix menuitems, options, and collection items.
- `src/components/ui/select.tsx`:
  - Upgraded `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectLabel`, `SelectSeparator`, and scroll buttons to warm retro paper (`bg-[#faf7f2]`, `hover:bg-[#ede7da]`, `border-[#e2dcd2]`) with crisp `font-semibold text-stone-900` typography and indigo active checkmarks.
- `src/components/ui/dropdown-menu.tsx`:
  - Enhanced `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, and separators with warm paper elevation in Light Mode and deep midnight glass in Dark Mode.
- `src/components/ui/popover.tsx`:
  - Updated `PopoverContent` to elevated warm paper styling with rich shadows and dark ink glass support.
- `src/components/kanban/board.tsx`:
  - Upgraded `Today`, `My Tasks`, and `All Assignees` toolbar filters from faint `text-stone-700` to high-contrast `border-stone-300 bg-white text-stone-900 font-semibold`, with vibrant ring and background accents when active (`ring-2 ring-amber-400/50` / `ring-2 ring-indigo-400/50`).
- `src/components/kanban/project-calendar.tsx`:
  - Upgraded `Filters` and `Upcoming` buttons to `border-stone-300 bg-white text-stone-900 font-semibold` with high contrast indicators.
- `src/components/kanban/assignee-picker.tsx`:
  - Fully styled the modal assignee dropdown popover for both Light Mode (`#faf7f2`, `#ede7da`, `text-stone-800`) and Dark Mode (`#120f26`, `text-stone-100`).
- `src/components/project/user-profile-popover.tsx`:
  - Updated profile dropdown card to adapt cleanly between Light Mode (`#faf7f2`) and Dark Mode (`#020208`).
- `src/components/notes/notes-panel.tsx`:
  - Replaced unstyled native select with an appearance-normalized select with custom `ChevronDown` indicator.
- `src/components/theme/theme.test.ts`:
  - Added automated test assertions for floating dropdown styling, Light Mode stone typography contrast, and select appearance normalization.

## Behavior Changes
- Toolbar buttons (`Today`, `My Tasks`, `All Assignees`, `Filters`, `Upcoming`) now feature sharp, dark, bold `text-stone-900` typography that clearly communicates active interactive controls instead of faint/disabled states ("ฟีลปิด").
- Active states have punchy vibrant badge tints and rings (`ring-2 ring-amber-400/50`, `ring-2 ring-indigo-400/50`).
- Dropdown options on Mac in Light Mode now render with legible dark charcoal text (`#292524` / `#0c0a09`) on a warm paper background (`#faf7f2`), instead of washed-out whitish text on flat white.
- Hovering or navigating dropdown items highlights them with a smooth paper tint (`#ede7da`) and dark text.
- Native `<select>` elements on macOS no longer render with the default bright white Aqua gradient button or cut off icons.
- AssigneePicker inside the CardModal properly supports Light and Dark modes without dark purple backgrounds with dark text.

## Database / Schema Changes
None.

## Verification
- `npm test`: 63 passed (303 tests total, including new assertions in `theme.test.ts`).
- `npm run lint`: 0 warnings, 0 errors.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Succeeded (all 35/35 pages generated cleanly).

## Follow-ups / Blockers
None.
