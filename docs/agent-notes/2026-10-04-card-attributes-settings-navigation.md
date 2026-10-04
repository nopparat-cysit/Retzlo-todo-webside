# Work Session Note: Card Attributes Settings Navigation

## Date
2026-10-04

## Objective
Update the `+` buttons next to Status, Priority, and Story Points in the Card Details modal (`CardModal`) so that clicking `+` navigates directly to the Project Settings page (`/project/[id]/settings?tab=attributes&subTab=[subTab]&boardId=[boardId]`), seamlessly embedding the interactive `BoardAttributesTab` into the Project Settings attributes view.

## Files Created, Modified, Deleted, or Moved
- `src/components/kanban/card-modal.tsx`:
  - Added `projectId?: string` prop.
  - Retrieved `useParams()` and `useRouter()` to determine target URL.
  - Implemented `handleOpenAttributesSetting(subTab)` which closes the modal and calls `router.push('/project/[projectId]/settings?tab=attributes&subTab=[subTab]&boardId=[boardId]')`.
  - Replaced secondary popup triggers with `handleOpenAttributesSetting` on desktop & mobile `+` buttons for Status, Priority, and Story Points.
- `src/components/kanban/board.tsx`:
  - Passed `projectId={board.projectId}` to `CardModal`.
- `src/components/project/project-settings-client.tsx`:
  - Parsed `subTab` (`status`, `priority`, `story-points`) and `boardId` URL query parameters.
  - Integrated `BoardAttributesTab` in the "attributes" tab along with a board picker dropdown for multi-board projects.
  - Added real-time custom priorities sync with `PATCH /api/boards/[boardId]` and `board-priorities-updated` custom event dispatching.
- `src/components/project/project-settings-client.test.ts`:
  - Added unit test cases verifying `BoardAttributesTab` integration and `card-modal.tsx` settings link.
- `docs/system-guide.md`:
  - Updated section 2.10 & 2.11 explaining direct settings navigation from card modal `+` buttons.
- `docs/theme-system.md`:
  - Appended dated changelog entry for Project Settings Interactive Board Attributes Manager.
- `src/components/help/help-center-client.tsx`:
  - Updated Help Center guide entries for Board & Card Attributes navigation.

## Important Behavior Changes
- Users clicking `+` next to Status, Priority, or Story Points in the card detail modal no longer see an overlay modal on top of a modal. Instead, it smoothly closes the card and opens the dedicated Project Settings Attributes tab with the corresponding sub-tab and board selected.
- Project Settings page now provides full direct editing of workflow columns, 10-level priority schema, and story points scale with automatic board selection.

## Database / Schema Changes
- None. Uses existing `Column`, `Board`, `customPriorities`, and `storyPointsScale` schema.

## Verification Commands Run & Results
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (Prisma schema is valid).
- `npx vitest run src/components/project/project-settings-client.test.ts src/components/kanban/card-attributes-edit.test.ts src/components/kanban/board-settings-attributes.test.ts`: Passed (24/24 tests passed).
- `npm run build`: Passed (38/38 static pages generated successfully).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
