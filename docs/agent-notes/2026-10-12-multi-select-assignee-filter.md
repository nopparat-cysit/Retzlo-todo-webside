# Multi-Select Checkbox Assignee Filter

**Date:** 2026-10-12  
**Objective:** Upgrade Kanban board assignee filtering from a single-select dropdown to a multi-select checkbox menu, enabling users to filter cards by one or more members simultaneously (as well as unassigned cards).

---

## Behavior Changes

1. **Multi-Select Checkboxes in Dropdown Menu:**
   - Transformed the assignee filter dropdown into a Radix `DropdownMenu` with interactive checkbox items.
   - Each member in "Members (N)" displays a custom retro-lofi checkbox (`[✓]`), their avatar badge (`AssigneeAvatar`), display name, and email.
   - Users can check/uncheck multiple assignees in a single session without the dropdown closing automatically (`e.preventDefault()` on item selection).
   - "Unassigned" features its own checkbox to filter cards with no assignees.
   - "All Assignees" resets the filter back to showing all cards, displaying an active indicator when no specific filter is active.
2. **Dynamic Trigger Button & Clear Action:**
   - When no filter is active, displays `<Users /> All Assignees`.
   - When 1 member is selected, displays their avatar and formatted name/email.
   - When 2+ members are selected, displays an avatar stack of the selected members and the total count (e.g. `2 assignees`).
   - Displays a dedicated `[X]` clear button beside the trigger whenever any member/unassigned filter is active.
   - Preserves synchronized interaction with the "My Tasks" quick filter button.
3. **Multi-Assignee Filtering Logic:**
   - Enhanced `filterCardsByAssignee` in `src/lib/kanban/assignees.ts` to accept `string | string[] | null | undefined`.
   - Supports filtering across multiple user IDs with OR logic, allowing combinations of selected members and unassigned tasks.
   - Backwards compatible with existing filter persistence storage (`"u1,u2"` comma-separated format).

---

## Files Modified

- `src/lib/kanban/assignees.ts`:
  - Enhanced `filterCardsByAssignee` to support arrays and comma-separated multiple assignee IDs.
- `src/lib/kanban/assignees.test.ts`:
  - Added unit tests for multiple assignees via string array, comma-separated string, and combined unassigned filtering.
- `src/components/kanban/board.tsx`:
  - Added `selectedAssigneeIds` state and `toggleAssignee` callback.
  - Replaced `<Select>` with multi-select `<DropdownMenu>` containing individual checkboxes for each member.
  - Updated trigger button to show stacked avatars and count when multiple members are selected.
- `src/components/kanban/card-interaction.test.ts`:
  - Updated test to assert multi-select Radix dropdown with checkboxes and avatar badges.

---

## Database / Schema Changes

None.

---

## Verification Results

1. **TypeScript:**
   ```bash
   npx tsc --noEmit
   # Exit code 0, 0 errors
   ```
2. **ESLint:**
   ```bash
   npm run lint
   # Exit code 0, No ESLint warnings or errors
   ```
3. **Unit Tests:**
   ```bash
   npx vitest run
   # Test Files: 95 passed (95)
   # Tests: 501 passed | 3 skipped (504)
   ```
4. **Next.js Production Build:**
   ```bash
   npm run build
   # Compiled successfully, 40/40 static pages generated, Exit code 0
   ```
5. **Prisma Schema Validation:**
   ```bash
   npx prisma validate
   # The schema at prisma\schema.prisma is valid
   ```
